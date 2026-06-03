import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CrmService {
  constructor(private prisma: PrismaService) {}

  async getConnections(companyId: number, q: any) {
    const page = Math.max(1, Number(q.page) || 1);
    const limit = Math.min(100, Number(q.limit) || 20);
    const skip = (page - 1) * limit;

    const where: any = {
      OR: [{ companyAId: companyId }, { companyBId: companyId }],
    };

    const [data, total] = await Promise.all([
      this.prisma.companyConnection.findMany({
        where, skip, take: limit,
        include: {
          companyA: { select: { id: true, name: true, country: true, plan: true } },
          companyB: { select: { id: true, name: true, country: true, plan: true } },
        },
        orderBy: { connectedAt: 'desc' },
      }),
      this.prisma.companyConnection.count({ where }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async addConnection(companyId: number, inviteCode: string) {
    const invite = await this.prisma.inviteCode.findUnique({
      where: { code: inviteCode },
    });
    if (!invite || !invite.isActive) throw new Error('Invalid invite code');
    if (invite.maxUses && invite.usedCount >= invite.maxUses) throw new Error('Invite code expired');

    const exists = await this.prisma.companyConnection.findUnique({
      where: { companyAId_companyBId: { companyAId: Math.min(companyId, invite.companyId), companyBId: Math.max(companyId, invite.companyId) } },
    });
    if (exists) throw new Error('Already connected');

    const conn = await this.prisma.companyConnection.create({
      data: {
        companyAId: Math.min(companyId, invite.companyId),
        companyBId: Math.max(companyId, invite.companyId),
        status: 'active',
      },
    });

    await this.prisma.inviteCode.update({
      where: { id: invite.id },
      data: { usedCount: { increment: 1 } },
    });

    return conn;
  }

  async searchCompanies(q: string) {
    return this.prisma.company.findMany({
      where: {
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { nationalId: { contains: q } },
        ],
        isActive: true,
      },
      select: { id: true, name: true, country: true },
      take: 10,
    });
  }

  // ── Deals / Pipeline ─────────────────────────────────

  private ser(v: any) {
    return JSON.parse(JSON.stringify(v, (_, x) => (typeof x === 'bigint' ? x.toString() : x)));
  }

  async getDeals(companyId: number, q: any) {
    const page  = Math.max(1, Number(q.page) || 1);
    const limit = Math.min(100, Number(q.limit) || 50);
    const where: any = {
      companyId,
      ...(q.stage       && { stage: q.stage.toUpperCase() }),
      ...(q.partnerName && { partnerName: { contains: q.partnerName, mode: 'insensitive' } }),
    };
    const [data, total] = await Promise.all([
      this.prisma.deal.findMany({
        where, skip: (page - 1) * limit, take: limit,
        orderBy: { updatedAt: 'desc' },
        include: { createdBy: { select: { id: true, name: true } } },
      }),
      this.prisma.deal.count({ where }),
    ]);
    return this.ser({ data, total, page, limit, totalPages: Math.ceil(total / limit) });
  }

  async createDeal(companyId: number, userId: number, dto: any) {
    const deal = await this.prisma.deal.create({
      data: {
        companyId,
        partnerName:      dto.partnerName,
        partnerCompanyId: dto.partnerCompanyId ?? null,
        title:            dto.title,
        titleFa:          dto.titleFa ?? null,
        stage:            (dto.stage ?? 'LEAD').toUpperCase() as any,
        valueIRR:         dto.valueIRR ? BigInt(dto.valueIRR) : null,
        probability:      Number(dto.probability ?? 50),
        closingDate:      dto.closingDate ? new Date(dto.closingDate) : null,
        ownerName:        dto.ownerName ?? null,
        notes:            dto.notes ?? null,
        createdById:      userId,
      },
    });
    return this.ser(deal);
  }

  async updateDealStage(companyId: number, id: string, dto: any) {
    const deal = await this.prisma.deal.findFirst({ where: { id, companyId } });
    if (!deal) throw new Error('Deal not found');
    const update: any = {};
    if (dto.stage)       update.stage       = dto.stage.toUpperCase();
    if (dto.probability !== undefined) update.probability = Number(dto.probability);
    if (dto.notes !== undefined)       update.notes       = dto.notes;
    if (dto.valueIRR !== undefined)    update.valueIRR    = BigInt(dto.valueIRR);
    if (dto.ownerName !== undefined)   update.ownerName   = dto.ownerName;
    if (dto.closingDate !== undefined) update.closingDate = dto.closingDate ? new Date(dto.closingDate) : null;
    if (dto.lostReason !== undefined)  update.lostReason  = dto.lostReason;
    const updated = await this.prisma.deal.update({ where: { id }, data: update });
    return this.ser(updated);
  }

  async deleteDeal(companyId: number, id: string) {
    const deal = await this.prisma.deal.findFirst({ where: { id, companyId } });
    if (!deal) throw new Error('Deal not found');
    return this.prisma.deal.delete({ where: { id } });
  }

  async getDealStats(companyId: number) {
    const deals = await this.prisma.deal.findMany({ where: { companyId } });
    const byStage = (s: string) => deals.filter(d => d.stage === s);
    const sumVal  = (list: typeof deals) => list.reduce((sum, d) => sum + Number(d.valueIRR ?? 0), 0);
    const weighted = deals
      .filter(d => !['WON','LOST'].includes(d.stage))
      .reduce((sum, d) => sum + Number(d.valueIRR ?? 0) * d.probability / 100, 0);
    return {
      total: deals.length,
      byStage: {
        LEAD:        byStage('LEAD').length,
        QUALIFIED:   byStage('QUALIFIED').length,
        PROPOSAL:    byStage('PROPOSAL').length,
        NEGOTIATION: byStage('NEGOTIATION').length,
        WON:         byStage('WON').length,
        LOST:        byStage('LOST').length,
      },
      wonValue:      sumVal(byStage('WON')),
      pipelineValue: weighted,
    };
  }
}
