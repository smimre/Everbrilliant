import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class ManufacturingService {
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

  // ── Work Orders ───────────────────────────────────────────────

  async getWorkOrders(companyId: number, q: any) {
    const { skip, take, page, limit } = this.paginate(q);
    const where: Prisma.WorkOrderWhereInput = {
      companyId,
      ...(q.status && { status: q.status.toUpperCase() as any }),
      ...(q.priority && { priority: q.priority.toUpperCase() as any }),
      ...(q.search && {
        OR: [
          { orderNo: { contains: q.search, mode: 'insensitive' } },
          { productName: { contains: q.search, mode: 'insensitive' } },
        ],
      }),
    };
    const [data, total] = await Promise.all([
      this.prisma.workOrder.findMany({
        where, skip, take, orderBy: { createdAt: 'desc' },
        include: {
          bom: { select: { id: true, code: true, product: true } },
          _count: { select: { wipEntries: true, qcInspections: true } },
        },
      }),
      this.prisma.workOrder.count({ where }),
    ]);
    return this.serialize(this.page(data, total, page, limit));
  }

  async getWorkOrder(companyId: number, id: string) {
    const wo = await this.prisma.workOrder.findFirst({
      where: { id, companyId },
      include: {
        bom: { include: { items: true } },
        wipEntries: { include: { recordedBy: { select: { id: true, name: true } } }, orderBy: { recordedAt: 'desc' } },
        qcInspections: { include: { inspectedBy: { select: { id: true, name: true } } }, orderBy: { inspectedAt: 'desc' } },
        createdBy: { select: { id: true, name: true } },
      },
    });
    if (!wo) throw new NotFoundException('Work order not found');
    return this.serialize(wo);
  }

  async createWorkOrder(companyId: number, userId: number, dto: any) {
    const year = new Date().getFullYear();
    const count = await this.prisma.workOrder.count({ where: { companyId } });
    const orderNo = `WO-${year}-${String(count + 1).padStart(3, '0')}`;

    const wo = await this.prisma.workOrder.create({
      data: {
        companyId,
        orderNo,
        bomId: dto.bomId || null,
        productName: dto.productName,
        productNameFa: dto.productNameFa || null,
        qty: dto.qty,
        unit: dto.unit || 'Pcs',
        startDate: dto.startDate ? new Date(dto.startDate) : null,
        dueDate: new Date(dto.dueDate),
        status: (dto.status || 'PLANNED').toUpperCase() as any,
        priority: (dto.priority || 'NORMAL').toUpperCase() as any,
        progress: dto.progress || 0,
        workcenter: dto.workcenter || null,
        estimatedCostIRR: dto.estimatedCostIRR ? BigInt(dto.estimatedCostIRR) : null,
        notes: dto.notes || null,
        createdById: userId,
      },
    });
    return this.serialize(wo);
  }

  async updateWorkOrder(companyId: number, id: string, dto: any) {
    await this.getWorkOrder(companyId, id);
    const update: any = {};
    if (dto.status !== undefined)   update.status   = dto.status.toUpperCase();
    if (dto.priority !== undefined) update.priority = dto.priority.toUpperCase();
    if (dto.progress !== undefined) update.progress = dto.progress;
    if (dto.notes !== undefined)    update.notes    = dto.notes;
    if (dto.workcenter !== undefined) update.workcenter = dto.workcenter;
    if (dto.startDate !== undefined)  update.startDate  = new Date(dto.startDate);
    if (dto.dueDate !== undefined)    update.dueDate    = new Date(dto.dueDate);
    if (dto.actualCostIRR !== undefined) update.actualCostIRR = BigInt(dto.actualCostIRR);
    if (dto.estimatedCostIRR !== undefined) update.estimatedCostIRR = BigInt(dto.estimatedCostIRR);
    if (dto.productName !== undefined)  update.productName  = dto.productName;
    if (dto.productNameFa !== undefined) update.productNameFa = dto.productNameFa;
    if (dto.bomId !== undefined) update.bomId = dto.bomId;
    if (dto.qty !== undefined) update.qty = dto.qty;
    if (dto.unit !== undefined) update.unit = dto.unit;
    if (update.status === 'COMPLETED') update.completedAt = new Date();

    const wo = await this.prisma.workOrder.update({ where: { id }, data: update });
    return this.serialize(wo);
  }

  // ── BOMs ──────────────────────────────────────────────────────

  async getBOMs(companyId: number, q: any) {
    const { skip, take, page, limit } = this.paginate(q);
    const where: Prisma.BOMTemplateWhereInput = {
      companyId,
      ...(q.isActive !== undefined && { isActive: q.isActive === 'true' }),
      ...(q.search && {
        OR: [
          { code: { contains: q.search, mode: 'insensitive' } },
          { product: { contains: q.search, mode: 'insensitive' } },
        ],
      }),
    };
    const [data, total] = await Promise.all([
      this.prisma.bOMTemplate.findMany({
        where, skip, take, orderBy: { createdAt: 'desc' },
        include: { _count: { select: { items: true, workOrders: true } } },
      }),
      this.prisma.bOMTemplate.count({ where }),
    ]);
    return this.serialize(this.page(data, total, page, limit));
  }

  async getBOM(companyId: number, id: string) {
    const bom = await this.prisma.bOMTemplate.findFirst({
      where: { id, companyId },
      include: { items: true, createdBy: { select: { id: true, name: true } } },
    });
    if (!bom) throw new NotFoundException('BOM not found');
    return this.serialize(bom);
  }

  async createBOM(companyId: number, userId: number, dto: any) {
    const bom = await this.prisma.bOMTemplate.create({
      data: {
        companyId,
        code: dto.code,
        product: dto.product,
        productFa: dto.productFa || null,
        unit: dto.unit || 'Pcs',
        description: dto.description || null,
        laborMinutes: dto.laborMinutes ? Number(dto.laborMinutes) : null,
        overheadRate: dto.overheadRate || null,
        isActive: dto.isActive !== false,
        createdById: userId,
        items: dto.items?.length
          ? {
              create: dto.items.map((item: any) => ({
                materialCode: item.materialCode,
                material: item.material,
                materialFa: item.materialFa || null,
                qty: item.qty,
                unit: item.unit,
                scrapFactor: item.scrapFactor || 0,
                unitCostIRR: item.unitCostIRR ? BigInt(item.unitCostIRR) : null,
                notes: item.notes || null,
              })),
            }
          : undefined,
      },
      include: { items: true },
    });
    return this.serialize(bom);
  }

  // ── Raw Materials ─────────────────────────────────────────────

  async getMaterials(companyId: number, q: any) {
    const { skip, take, page, limit } = this.paginate(q);
    const where: Prisma.RawMaterialWhereInput = {
      companyId,
      ...(q.search && {
        OR: [
          { code: { contains: q.search, mode: 'insensitive' } },
          { material: { contains: q.search, mode: 'insensitive' } },
        ],
      }),
    };

    const [data, total] = await Promise.all([
      this.prisma.rawMaterial.findMany({ where, skip, take, orderBy: { createdAt: 'desc' } }),
      this.prisma.rawMaterial.count({ where }),
    ]);

    // Filter shortages client-side or at DB level
    let filteredData = data;
    if (q.shortage === 'true') {
      filteredData = data.filter(m => Number(m.available) < Number(m.required));
    }

    return this.serialize(this.page(filteredData, total, page, limit));
  }

  async createMaterial(companyId: number, dto: any) {
    const mat = await this.prisma.rawMaterial.create({
      data: {
        companyId,
        code: dto.code,
        material: dto.material,
        materialFa: dto.materialFa || null,
        unit: dto.unit,
        available: dto.available || 0,
        required: dto.required || 0,
        reorderPoint: dto.reorderPoint || 0,
        unitCostIRR: dto.unitCostIRR ? BigInt(dto.unitCostIRR) : null,
        supplier: dto.supplier || null,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
        notes: dto.notes || null,
      },
    });
    return this.serialize(mat);
  }

  async updateMaterial(companyId: number, id: string, dto: any) {
    const existing = await this.prisma.rawMaterial.findFirst({ where: { id, companyId } });
    if (!existing) throw new NotFoundException('Material not found');
    const update: any = {};
    if (dto.material !== undefined)    update.material    = dto.material;
    if (dto.materialFa !== undefined)  update.materialFa  = dto.materialFa;
    if (dto.unit !== undefined)        update.unit        = dto.unit;
    if (dto.available !== undefined)   update.available   = dto.available;
    if (dto.required !== undefined)    update.required    = dto.required;
    if (dto.reorderPoint !== undefined) update.reorderPoint = dto.reorderPoint;
    if (dto.unitCostIRR !== undefined)  update.unitCostIRR  = BigInt(dto.unitCostIRR);
    if (dto.supplier !== undefined)    update.supplier    = dto.supplier;
    if (dto.dueDate !== undefined)     update.dueDate     = new Date(dto.dueDate);
    if (dto.notes !== undefined)       update.notes       = dto.notes;
    const mat = await this.prisma.rawMaterial.update({ where: { id }, data: update });
    return this.serialize(mat);
  }

  async createPO(companyId: number, userId: number, dto: any) {
    // Creates a TradeRequest with type "purchase" for the material shortage
    const po = await this.prisma.tradeRequest.create({
      data: {
        buyerCompanyId: companyId,
        product: dto.product || dto.material,
        qty: dto.qty || '1',
        unit: dto.unit || 'Pcs',
        amountIRR: dto.amountIRR ? BigInt(dto.amountIRR) : null,
        currency: dto.currency || 'IRR',
        status: 'PENDING',
        priority: (dto.priority || 'NORMAL').toUpperCase() as any,
        deadline: dto.deadline ? new Date(dto.deadline) : null,
        note: `[MRP] Material shortage purchase order. ${dto.note || ''}`.trim(),
        createdById: userId,
      },
    });
    return this.serialize(po);
  }

  // ── WIP ───────────────────────────────────────────────────────

  async getWIP(companyId: number) {
    const entries = await this.prisma.wIPEntry.findMany({
      where: { workOrder: { companyId } },
      include: {
        workOrder: { select: { id: true, orderNo: true, productName: true, status: true, progress: true } },
        recordedBy: { select: { id: true, name: true } },
      },
      orderBy: { recordedAt: 'desc' },
    });

    // Group by workOrderId
    const grouped: Record<string, any> = {};
    for (const entry of entries) {
      const key = entry.workOrderId;
      if (!grouped[key]) {
        grouped[key] = {
          workOrder: entry.workOrder,
          entries: [],
        };
      }
      grouped[key].entries.push(entry);
    }

    return this.serialize(Object.values(grouped));
  }

  async addWIPEntry(companyId: number, userId: number, workOrderId: string, dto: any) {
    // Verify WO belongs to company
    const wo = await this.prisma.workOrder.findFirst({ where: { id: workOrderId, companyId } });
    if (!wo) throw new NotFoundException('Work order not found');

    const entry = await this.prisma.wIPEntry.create({
      data: {
        workOrderId,
        stage: dto.stage,
        completedQty: dto.completedQty || 0,
        actualCostIRR: dto.actualCostIRR ? BigInt(dto.actualCostIRR) : null,
        note: dto.note || null,
        recordedById: userId,
      },
    });
    return this.serialize(entry);
  }

  // ── Quality Checks ────────────────────────────────────────────

  async getQualityChecks(companyId: number, q: any) {
    const { skip, take, page, limit } = this.paginate(q);
    const where: Prisma.QCInspectionWhereInput = {
      companyId,
      ...(q.result && { result: q.result.toUpperCase() as any }),
      ...(q.workOrderId && { workOrderId: q.workOrderId }),
    };
    const [data, total] = await Promise.all([
      this.prisma.qCInspection.findMany({
        where, skip, take, orderBy: { inspectedAt: 'desc' },
        include: {
          workOrder: { select: { id: true, orderNo: true, productName: true } },
          inspectedBy: { select: { id: true, name: true } },
        },
      }),
      this.prisma.qCInspection.count({ where }),
    ]);
    return this.serialize(this.page(data, total, page, limit));
  }

  async createQCInspection(companyId: number, userId: number, workOrderId: string, dto: any) {
    const wo = await this.prisma.workOrder.findFirst({ where: { id: workOrderId, companyId } });
    if (!wo) throw new NotFoundException('Work order not found');

    const inspection = await this.prisma.qCInspection.create({
      data: {
        workOrderId,
        companyId,
        inspectedQty: dto.inspectedQty,
        passedQty: dto.passedQty,
        failedQty: dto.failedQty || 0,
        result: (dto.result || 'PENDING').toUpperCase() as any,
        notes: dto.notes || null,
        defectCodes: dto.defectCodes || null,
        inspectedById: userId,
      },
    });
    return this.serialize(inspection);
  }

  // ── Reports ───────────────────────────────────────────────────

  async getReportsSummary(companyId: number) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      activeWOs,
      plannedWOs,
      inQCWOs,
      completedThisMonth,
      allMaterials,
      costAggregate,
    ] = await Promise.all([
      this.prisma.workOrder.count({ where: { companyId, status: 'IN_PROGRESS' } }),
      this.prisma.workOrder.count({ where: { companyId, status: 'PLANNED' } }),
      this.prisma.workOrder.count({ where: { companyId, status: 'QC' } }),
      this.prisma.workOrder.count({ where: { companyId, status: 'COMPLETED', completedAt: { gte: startOfMonth } } }),
      this.prisma.rawMaterial.findMany({ where: { companyId }, select: { available: true, required: true } }),
      this.prisma.workOrder.aggregate({ where: { companyId }, _sum: { estimatedCostIRR: true } }),
    ]);

    const shortageCount = allMaterials.filter(m => Number(m.available) < Number(m.required)).length;

    return this.serialize({
      activeWorkOrders: activeWOs,
      plannedWorkOrders: plannedWOs,
      inQCWorkOrders: inQCWOs,
      completedThisMonth,
      materialShortages: shortageCount,
      totalEstimatedCostIRR: costAggregate._sum.estimatedCostIRR ?? 0,
    });
  }
}
