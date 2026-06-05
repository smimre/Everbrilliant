import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class LogisticsService {
  constructor(private prisma: PrismaService) {}

  private paginate(q: any) {
    const page = Math.max(1, Number(q.page) || 1);
    const limit = Math.min(100, Number(q.limit) || 20);
    return { skip: (page - 1) * limit, take: limit, page, limit };
  }

  private page<T>(data: T[], total: number, page: number, limit: number) {
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  private serialize<T>(data: T): T {
    return JSON.parse(JSON.stringify(data, (_, v) => (typeof v === 'bigint' ? v.toString() : v)));
  }

  private genTrackingCode(): string {
    return `EB-TRK-${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 100).toString().padStart(2, '0')}`;
  }

  private buildDefaultStages(shipType: string) {
    const base = [
      { key: 'booked', label: 'Booked', labelFa: 'ثبت', stageOrder: 0 },
      { key: 'picked_up', label: 'Picked Up', labelFa: 'تحویل', stageOrder: 1 },
      { key: 'in_transit', label: 'In Transit', labelFa: 'حمل', stageOrder: 2 },
    ];
    if (shipType === 'international') {
      base.push({ key: 'customs', label: 'Customs', labelFa: 'گمرک', stageOrder: 3 });
    }
    base.push({ key: 'delivered', label: 'Delivered', labelFa: 'تحویل نهایی', stageOrder: base.length });
    return base;
  }

  // ── Shipments ────────────────────────────────────────────────

  async getShipments(companyId: number, q: any) {
    const { skip, take, page, limit } = this.paginate(q);
    const where: any = {
      companyId,
      ...(q.status && q.status !== 'all' && { status: q.status }),
      ...(q.type && { shipType: q.type }),
      ...(q.search && {
        OR: [
          { trackingCode: { contains: q.search, mode: 'insensitive' } },
          { cargo: { contains: q.search, mode: 'insensitive' } },
        ],
      }),
    };
    const [data, total] = await Promise.all([
      this.prisma.logisticsShipment.findMany({
        where, skip, take,
        orderBy: { createdAt: 'desc' },
        include: { stages: { orderBy: { stageOrder: 'asc' } } },
      }),
      this.prisma.logisticsShipment.count({ where }),
    ]);
    return this.serialize(this.page(data, total, page, limit));
  }

  async createShipment(companyId: number, dto: any) {
    const trackingCode = dto.trackingCode || this.genTrackingCode();
    const defaultStages = this.buildDefaultStages(dto.shipType || 'domestic');
    const result = await this.prisma.logisticsShipment.create({
      data: {
        companyId,
        trackingCode,
        cargo: dto.cargo,
        shipType: dto.shipType || 'domestic',
        status: 'booked',
        origin: dto.origin,
        destination: dto.destination,
        weight: dto.weight ? parseFloat(dto.weight) : null,
        weightUnit: dto.weightUnit || 'تن',
        volume: dto.volume ? parseFloat(dto.volume) : null,
        cost: dto.cost ? BigInt(dto.cost) : BigInt(0),
        costPaid: dto.costPaid || false,
        sellerName: dto.sellerName || null,
        buyerName: dto.buyerName || null,
        notes: dto.notes || null,
        customsStatus: dto.shipType === 'international' ? 'pending' : null,
        stages: {
          create: defaultStages.map((s, idx) => ({
            ...s,
            isDone: idx === 0,
            date: idx === 0 ? new Date().toLocaleDateString('fa-IR') : null,
          })),
        },
      },
      include: { stages: { orderBy: { stageOrder: 'asc' } } },
    });
    return this.serialize(result);
  }

  async updateShipment(companyId: number, id: string, dto: any) {
    const existing = await this.prisma.logisticsShipment.findFirst({ where: { id, companyId } });
    if (!existing) throw new Error('Shipment not found');
    const result = await this.prisma.logisticsShipment.update({
      where: { id },
      data: {
        ...(dto.status !== undefined && { status: dto.status }),
        ...(dto.costPaid !== undefined && { costPaid: dto.costPaid }),
        ...(dto.waybillNo !== undefined && { waybillNo: dto.waybillNo }),
        ...(dto.hsCode !== undefined && { hsCode: dto.hsCode }),
        ...(dto.customsStatus !== undefined && { customsStatus: dto.customsStatus }),
        ...(dto.customsNotes !== undefined && { customsNotes: dto.customsNotes }),
        ...(dto.notes !== undefined && { notes: dto.notes }),
        ...(dto.insurer !== undefined && { insurer: dto.insurer }),
        ...(dto.insuranceAmt !== undefined && { insuranceAmt: BigInt(dto.insuranceAmt) }),
        ...(dto.policyNo !== undefined && { policyNo: dto.policyNo }),
      },
      include: { stages: { orderBy: { stageOrder: 'asc' } } },
    });
    return this.serialize(result);
  }

  async advanceStage(companyId: number, id: string, dto: { date?: string; note?: string }) {
    const ship = await this.prisma.logisticsShipment.findFirst({
      where: { id, companyId },
      include: { stages: { orderBy: { stageOrder: 'asc' } } },
    });
    if (!ship) throw new Error('Shipment not found');

    const nextStage = ship.stages.find(s => !s.isDone);
    if (!nextStage) throw new Error('All stages complete');

    await this.prisma.logisticsStage.update({
      where: { id: nextStage.id },
      data: {
        isDone: true,
        date: dto.date || new Date().toLocaleDateString('fa-IR'),
        ...(dto.note && { note: dto.note }),
      },
    });

    const allDone = ship.stages.every(s => s.id === nextStage.id || s.isDone);
    const newStatus = allDone ? 'delivered' : nextStage.key;

    const result = await this.prisma.logisticsShipment.update({
      where: { id },
      data: { status: newStatus },
      include: { stages: { orderBy: { stageOrder: 'asc' } } },
    });
    return this.serialize(result);
  }

  async issueWaybill(companyId: number, id: string) {
    const existing = await this.prisma.logisticsShipment.findFirst({ where: { id, companyId } });
    if (!existing) throw new Error('Shipment not found');
    const waybillNo = `EB-WB-${Date.now().toString().slice(-5)}`;
    const result = await this.prisma.logisticsShipment.update({
      where: { id },
      data: { waybillNo },
      include: { stages: { orderBy: { stageOrder: 'asc' } } },
    });
    return this.serialize(result);
  }

  // ── Rate Quotes ───────────────────────────────────────────────

  async getRateQuotes(companyId: number) {
    const data = await this.prisma.logisticsRateQuote.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' },
    });
    return this.serialize(data);
  }

  async createRateQuote(companyId: number, dto: any) {
    const result = await this.prisma.logisticsRateQuote.create({
      data: {
        companyId,
        fromLoc: dto.from,
        toLoc: dto.to,
        mode: dto.mode || dto.type || 'Truck',
        rate: BigInt(dto.rate),
        unit: dto.unit || 'per load',
      },
    });
    return this.serialize(result);
  }

  async toggleRateQuote(companyId: number, id: string) {
    const existing = await this.prisma.logisticsRateQuote.findFirst({ where: { id, companyId } });
    if (!existing) throw new Error('Rate quote not found');
    const result = await this.prisma.logisticsRateQuote.update({
      where: { id },
      data: { active: !existing.active },
    });
    return this.serialize(result);
  }

  // ── Waybills ──────────────────────────────────────────────────

  async getWaybills(companyId: number, q: any) {
    const { skip, take, page, limit } = this.paginate(q);
    const where: any = { companyId, waybillNo: { not: null } };
    const [data, total] = await Promise.all([
      this.prisma.logisticsShipment.findMany({ where, skip, take, orderBy: { createdAt: 'desc' }, include: { stages: { orderBy: { stageOrder: 'asc' } } } }),
      this.prisma.logisticsShipment.count({ where }),
    ]);
    return this.serialize(this.page(data, total, page, limit));
  }

  // ── Customs ───────────────────────────────────────────────────

  async getCustoms(companyId: number, q: any) {
    const { skip, take, page, limit } = this.paginate(q);
    const where: any = { companyId, customsStatus: { not: null } };
    const [data, total] = await Promise.all([
      this.prisma.logisticsShipment.findMany({ where, skip, take, orderBy: { createdAt: 'desc' }, include: { stages: { orderBy: { stageOrder: 'asc' } } } }),
      this.prisma.logisticsShipment.count({ where }),
    ]);
    return this.serialize(this.page(data, total, page, limit));
  }

  // ── Insurance ─────────────────────────────────────────────────

  async getInsurance(companyId: number, q: any) {
    const { skip, take, page, limit } = this.paginate(q);
    const where: any = { companyId, insurer: { not: null } };
    const [data, total] = await Promise.all([
      this.prisma.logisticsShipment.findMany({ where, skip, take, orderBy: { createdAt: 'desc' }, include: { stages: { orderBy: { stageOrder: 'asc' } } } }),
      this.prisma.logisticsShipment.count({ where }),
    ]);
    return this.serialize(this.page(data, total, page, limit));
  }

  // ── Reports ───────────────────────────────────────────────────

  async getReports(companyId: number) {
    const [all, active, delivered, unpaid] = await Promise.all([
      this.prisma.logisticsShipment.count({ where: { companyId } }),
      this.prisma.logisticsShipment.count({ where: { companyId, status: { notIn: ['delivered', 'cancelled'] } } }),
      this.prisma.logisticsShipment.count({ where: { companyId, status: 'delivered' } }),
      this.prisma.logisticsShipment.count({ where: { companyId, costPaid: false, status: { not: 'cancelled' } } }),
    ]);
    const revenue = await this.prisma.logisticsShipment.aggregate({
      where: { companyId, costPaid: true },
      _sum: { cost: true },
    });
    return this.serialize({
      total: all,
      active,
      delivered,
      unpaid,
      revenue: revenue._sum.cost?.toString() ?? '0',
    });
  }
}
