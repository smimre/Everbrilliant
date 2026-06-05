import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class TradingService {
  constructor(protected prisma: PrismaService) {}

  private paginate(q: any) {
    const page = Math.max(1, Number(q.page) || 1);
    const limit = Math.min(100, Number(q.limit) || 20);
    return { skip: (page - 1) * limit, take: limit, page, limit };
  }

  private page<T>(data: T[], total: number, page: number, limit: number) {
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  // ── Requests ──────────────────────────────
  async getRequests(companyId: number, q: any) {
    const { skip, take, page, limit } = this.paginate(q);
    const where: Prisma.TradeRequestWhereInput = {
      OR: [{ buyerCompanyId: companyId }, { sellerCompanyId: companyId }],
      ...(q.status && { status: q.status.toUpperCase() as any }),
      ...(q.search && { product: { contains: q.search, mode: 'insensitive' } }),
    };
    const [data, total] = await Promise.all([
      this.prisma.tradeRequest.findMany({
        where, skip, take, orderBy: { createdAt: 'desc' },
        include: { buyerCompany: { select: { id:true, name:true } }, sellerCompany: { select: { id:true, name:true } }, _count: { select: { quotes: true } } },
      }),
      this.prisma.tradeRequest.count({ where }),
    ]);
    return this.page(data, total, page, limit);
  }

  async getRequest(companyId: number, id: string) {
    const req = await this.prisma.tradeRequest.findFirst({
      where: { id, OR: [{ buyerCompanyId: companyId }, { sellerCompanyId: companyId }] },
      include: { quotes: true, contract: true, invoice: { include: { items: true } }, shipment: true, qualityChecks: true, followUps: true },
    });
    if (!req) throw new NotFoundException('Request not found');
    return req;
  }

  async createRequest(companyId: number, userId: number, dto: any) {
    return this.prisma.tradeRequest.create({
      data: {
        buyerCompanyId: companyId,
        sellerCompanyId: dto.sellerCompanyId ? Number(dto.sellerCompanyId) : undefined,
        product: dto.product,
        qty: dto.qty ?? 0,
        unit: dto.unit || 'unit',
        amountIRR: dto.amountIRR ? BigInt(dto.amountIRR) : undefined,
        currency: dto.currency || 'IRR',
        status: 'PENDING', priority: (dto.priority || 'NORMAL').toUpperCase() as any,
        deadline: dto.deadline ? new Date(dto.deadline) : undefined,
        note: dto.note, hsCode: dto.hsCode,
        createdById: userId,
      },
    });
  }

  async createContractDirect(companyId: number, userId: number, dto: any) {
    if (!dto.counterpartyId) throw new BadRequestException('counterpartyId is required');
    const counterpartyId = Number(dto.counterpartyId);
    const isBuyer = dto.role !== 'seller';
    const buyerCompanyId  = isBuyer ? companyId : counterpartyId;
    const sellerCompanyId = isBuyer ? counterpartyId : companyId;

    return this.prisma.$transaction(async (tx) => {
      const req = await tx.tradeRequest.create({
        data: {
          buyerCompanyId,
          sellerCompanyId,
          product: dto.product || dto.title,
          qty: dto.qty ? Number(dto.qty) : 0,
          unit: dto.unit || 'unit',
          currency: dto.currency || 'IRR',
          status: 'COMPLETED' as any,
          priority: 'NORMAL' as any,
          createdById: userId,
          note: dto.paymentTerms || undefined,
        },
      });
      return tx.contract.create({
        data: {
          requestId: req.id,
          buyerCompanyId,
          sellerCompanyId,
          title: dto.title,
          amountIRR: dto.totalPrice ? BigInt(Math.round(Number(dto.totalPrice))) : BigInt(0),
          currency: dto.currency || 'IRR',
          status: 'DRAFT' as any,
          deliveryDate: dto.deliveryDate ? new Date(dto.deliveryDate) : undefined,
          terms: dto.paymentTerms || undefined,
        },
      });
    });
  }

  async updateRequest(companyId: number, id: string, dto: any) {
    await this.getRequest(companyId, id);
    return this.prisma.tradeRequest.update({
      where: { id },
      data: { ...dto, ...(dto.amountIRR && { amountIRR: BigInt(dto.amountIRR) }) },
    });
  }

  async cancelRequest(companyId: number, id: string) {
    await this.getRequest(companyId, id);
    return this.prisma.tradeRequest.update({ where: { id }, data: { status: 'CANCELLED' } });
  }

  async issueHavaleh(companyId: number, id: string) {
    const req = await this.prisma.tradeRequest.findFirst({
      where: { id, sellerCompanyId: companyId },
    });
    if (!req) throw new NotFoundException('Request not found');
    if (req.status !== 'PAID' as any) throw new BadRequestException('Request must be PAID before issuing havaleh');

    const seq = await this.prisma.tradeRequest.count({ where: { sellerCompanyId: companyId, havNo: { not: null } } });
    const havNo = `HAV-${String(seq + 1).padStart(4, '0')}-${id.slice(-4).toUpperCase()}`;

    return this.prisma.tradeRequest.update({
      where: { id },
      data: { status: 'ISSUED' as any, havNo, issuedAt: new Date() },
    });
  }

  async confirmReceipt(companyId: number, id: string) {
    const req = await this.prisma.tradeRequest.findFirst({
      where: { id, buyerCompanyId: companyId },
    });
    if (!req) throw new NotFoundException('Request not found');
    if (req.status !== 'ISSUED' as any) throw new BadRequestException('Request must be ISSUED to confirm receipt');
    return this.prisma.tradeRequest.update({ where: { id }, data: { status: 'COMPLETED' as any } });
  }

  async markPaid(companyId: number, id: string) {
    const req = await this.prisma.tradeRequest.findFirst({
      where: { id, buyerCompanyId: companyId },
    });
    if (!req) throw new NotFoundException('Request not found');
    if (req.status !== 'APPROVED' as any) throw new BadRequestException('Request must be APPROVED before marking paid');
    return this.prisma.tradeRequest.update({ where: { id }, data: { status: 'PAID' as any } });
  }

  // ── Quotes ────────────────────────────────
  async getAllQuotes(companyId: number, q: any) {
    const { skip, take, page, limit } = this.paginate(q);
    const where = {
      OR: [
        { sellerCompanyId: companyId },
        { request: { buyerCompanyId: companyId } },
      ],
    };
    const [data, total] = await Promise.all([
      this.prisma.quote.findMany({ where, skip, take, orderBy: { createdAt: 'desc' }, include: { request: { select: { id: true, product: true, status: true } } } }),
      this.prisma.quote.count({ where }),
    ]);
    return this.page(data, total, page, limit);
  }

  async getQuotes(companyId: number, requestId: string) {
    return this.prisma.quote.findMany({
      where: { requestId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createQuote(companyId: number, userId: number, dto: any) {
    const quote = await this.prisma.quote.create({
      data: {
        requestId: dto.requestId,
        sellerCompanyId: companyId,
        unitPrice: dto.unitPrice, currency: dto.currency || 'IRR',
        totalPrice: dto.totalPrice ?? dto.unitPrice,
        validUntil: dto.validUntil ? new Date(dto.validUntil) : undefined,
        deliveryDays: dto.deliveryDays,
        note: dto.note, status: 'PENDING', createdById: userId,
      },
    });
    // Notify buyer by moving request to QUOTED and stamping the offered amount
    await this.prisma.tradeRequest.update({
      where: { id: dto.requestId },
      data: {
        status: 'QUOTED',
        amountIRR: dto.unitPrice ? BigInt(Math.round(Number(dto.unitPrice))) : undefined,
      },
    });
    return quote;
  }

  async acceptQuote(companyId: number, id: string) {
    const quote = await this.prisma.quote.findUnique({ where: { id }, include: { request: true } });
    if (!quote || quote.request.buyerCompanyId !== companyId) throw new ForbiddenException();
    await this.prisma.quote.updateMany({ where: { requestId: quote.requestId }, data: { status: 'REJECTED' } });
    const updated = await this.prisma.quote.update({ where: { id }, data: { status: 'ACCEPTED' } });
    await this.prisma.tradeRequest.update({ where: { id: quote.requestId }, data: { status: 'APPROVED', sellerCompanyId: quote.sellerCompanyId } });
    return updated;
  }

  // ── Contracts ─────────────────────────────
  async getContracts(companyId: number, q: any) {
    const { skip, take, page, limit } = this.paginate(q);
    const where: Prisma.ContractWhereInput = {
      OR: [{ buyerCompanyId: companyId }, { sellerCompanyId: companyId }],
    };
    const [data, total] = await Promise.all([
      this.prisma.contract.findMany({ where, skip, take, orderBy: { createdAt: 'desc' } }),
      this.prisma.contract.count({ where }),
    ]);
    return this.page(data, total, page, limit);
  }

  async signContract(companyId: number, id: string) {
    const contract = await this.prisma.contract.findUnique({ where: { id } });
    if (!contract) throw new NotFoundException();

    const isBuyer = contract.buyerCompanyId === companyId;
    const isSeller = contract.sellerCompanyId === companyId;
    if (!isBuyer && !isSeller) throw new ForbiddenException();

    const update: any = {};
    if (isBuyer) { update.signedBuyer = true; update.signedBuyerAt = new Date(); }
    if (isSeller) { update.signedSeller = true; update.signedSellerAt = new Date(); }

    const updated = await this.prisma.contract.update({ where: { id }, data: update });
    if (updated.signedBuyer && updated.signedSeller) {
      await this.prisma.contract.update({ where: { id }, data: { status: 'ACTIVE' } });
    }
    return updated;
  }

  // ── Tenders ───────────────────────────────
  async getTenders(q: any, ownerCompanyId?: number) {
    const { skip, take, page, limit } = this.paginate(q);
    const where: Prisma.TenderWhereInput = ownerCompanyId
      ? { companyId: ownerCompanyId, ...(q.status && { status: q.status.toUpperCase() as any }) }
      : { status: q.status ? q.status.toUpperCase() as any : 'OPEN', ...(q.type && { type: q.type.toUpperCase() as any }) };
    const [data, total] = await Promise.all([
      this.prisma.tender.findMany({
        where, skip, take, orderBy: { createdAt: 'desc' },
        include: {
          products: true,
          company: { select: { id: true, name: true } },
          _count: { select: { bids: true } },
        },
      }),
      this.prisma.tender.count({ where }),
    ]);
    return this.page(data.map(t => ({ ...t, bidsCount: t._count.bids })), total, page, limit);
  }

  async createTender(companyId: number, userId: number, dto: any) {
    const type = (dto.type || '').toUpperCase();
    if (!['AUCTION', 'TENDER'].includes(type))
      throw new BadRequestException('type must be AUCTION or TENDER');
    const startDate = dto.startDate ? new Date(dto.startDate) : new Date();
    const endDate = dto.endDate ? new Date(dto.endDate) : new Date(Date.now() + 30 * 86400_000);
    return this.prisma.tender.create({
      data: {
        type: type as any,
        title: dto.title,
        description: dto.description || undefined,
        companyId,
        startDate,
        endDate,
        isPublic: dto.isPublic !== false,
        status: 'OPEN' as any,
        createdById: userId,
        products: { create: (dto.products || []).map((p: any) => ({ name: p.name, qty: p.qty || p.qtyMax || 0, unit: p.unit || 'unit' })) },
      },
      include: { products: true, company: { select: { id: true, name: true } } },
    });
  }

  async placeBid(companyId: number, userId: number, tenderId: string, dto: any) {
    const tender = await this.prisma.tender.findUnique({ where: { id: tenderId } });
    if (!tender || tender.status !== 'OPEN') throw new BadRequestException('Tender not accepting bids');
    return this.prisma.bid.create({
      data: { tenderId, bidderId: userId, companyId, totalPrice: dto.totalPrice, currency: dto.currency || 'IRR', note: dto.note, status: 'PENDING' },
    });
  }

  async getTenderBids(companyId: number, tenderId: string) {
    const tender = await this.prisma.tender.findFirst({ where: { id: tenderId, companyId } });
    if (!tender) throw new NotFoundException('Tender not found');
    return this.prisma.bid.findMany({
      where: { tenderId },
      orderBy: { totalPrice: 'asc' },
      include: { tender: { select: { id: true, title: true } } },
    });
  }

  async closeTender(companyId: number, id: string) {
    const t = await this.prisma.tender.findFirst({ where: { id, companyId } });
    if (!t) throw new NotFoundException('Tender not found');
    if (t.status !== 'OPEN') throw new BadRequestException('Tender is not open');
    return this.prisma.tender.update({ where: { id }, data: { status: 'CLOSED' } });
  }

  async awardTender(companyId: number, id: string) {
    const t = await this.prisma.tender.findFirst({ where: { id, companyId } });
    if (!t) throw new NotFoundException('Tender not found');
    if (t.status !== 'CLOSED') throw new BadRequestException('Tender must be closed first');
    return this.prisma.tender.update({ where: { id }, data: { status: 'AWARDED', awardDate: new Date() } });
  }

  async getAllFollowUps(companyId: number, q: any) {
    const { skip, take, page, limit } = this.paginate(q);
    const where = {
      request: { OR: [{ buyerCompanyId: companyId }, { sellerCompanyId: companyId }] },
      ...(q.done !== undefined && { isDone: q.done === 'true' }),
    };
    const [data, total] = await Promise.all([
      this.prisma.followUp.findMany({ where, skip, take, orderBy: { createdAt: 'desc' }, include: { request: { select: { id: true, product: true } } } }),
      this.prisma.followUp.count({ where }),
    ]);
    return this.page(data, total, page, limit);
  }

  async getFollowUps(companyId: number, requestId: string) {
    const req = await this.prisma.tradeRequest.findFirst({ where: { id: requestId, OR: [{ buyerCompanyId: companyId }, { sellerCompanyId: companyId }] } });
    if (!req) throw new NotFoundException('Request not found');
    return this.prisma.followUp.findMany({ where: { requestId }, orderBy: { createdAt: 'desc' } });
  }

  async createFollowUp(companyId: number, userId: number, requestId: string, dto: any) {
    const req = await this.prisma.tradeRequest.findFirst({ where: { id: requestId, OR: [{ buyerCompanyId: companyId }, { sellerCompanyId: companyId }] } });
    if (!req) throw new NotFoundException('Request not found');
    return this.prisma.followUp.create({
      data: { requestId, userId, note: dto.note || '', nextDate: dto.nextDate ? new Date(dto.nextDate) : null },
    });
  }

  async markFollowUpDone(companyId: number, id: string) {
    const fu = await this.prisma.followUp.findUnique({
      where: { id },
      include: { request: { select: { buyerCompanyId: true, sellerCompanyId: true } } },
    });
    if (!fu || (fu.request.buyerCompanyId !== companyId && fu.request.sellerCompanyId !== companyId))
      throw new NotFoundException('Follow-up not found');
    return this.prisma.followUp.update({ where: { id }, data: { isDone: true } });
  }

  async getCRMStats(companyId: number) {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd   = new Date(todayStart.getTime() + 86400_000);

    const [overdue, todayCount, openCount, wonCount, totalCount] = await Promise.all([
      this.prisma.followUp.count({
        where: { isDone: false, nextDate: { lt: todayStart }, request: { OR: [{ buyerCompanyId: companyId }, { sellerCompanyId: companyId }] } },
      }),
      this.prisma.followUp.count({
        where: { isDone: false, nextDate: { gte: todayStart, lt: todayEnd }, request: { OR: [{ buyerCompanyId: companyId }, { sellerCompanyId: companyId }] } },
      }),
      this.prisma.tradeRequest.count({
        where: { OR: [{ buyerCompanyId: companyId }, { sellerCompanyId: companyId }], status: { notIn: ['COMPLETED', 'REJECTED', 'CANCELLED'] } },
      }),
      this.prisma.tradeRequest.count({
        where: { OR: [{ buyerCompanyId: companyId }, { sellerCompanyId: companyId }], status: { in: ['COMPLETED', 'PAID'] } },
      }),
      this.prisma.tradeRequest.count({
        where: { OR: [{ buyerCompanyId: companyId }, { sellerCompanyId: companyId }] },
      }),
    ]);
    return { overdue, today: todayCount, open: openCount, won: wonCount, total: totalCount, convRate: totalCount ? Math.round(wonCount / totalCount * 100) : 0 };
  }

  async getConnections(companyId: number, q: any) {
    const { skip, take, page, limit } = this.paginate(q);
    const where = { OR: [{ companyAId: companyId }, { companyBId: companyId }] };
    const [data, total] = await Promise.all([
      this.prisma.companyConnection.findMany({
        where, skip, take, orderBy: { connectedAt: 'desc' },
        include: {
          companyA: { select: { id: true, name: true, country: true } },
          companyB: { select: { id: true, name: true, country: true } },
        },
      }),
      this.prisma.companyConnection.count({ where }),
    ]);
    return this.page(data, total, page, limit);
  }

  // ── Company Blacklist ─────────────────────────────────

  async getBlacklist(companyId: number, q: any) {
    const { skip, take, page, limit } = this.paginate(q);
    const where: any = {
      ownerCompanyId: companyId,
      ...(q.status   && { status:   q.status.toUpperCase() }),
      ...(q.severity && { severity: q.severity.toUpperCase() }),
      ...(q.search   && { companyName: { contains: q.search, mode: 'insensitive' } }),
    };
    const [data, total] = await Promise.all([
      this.prisma.companyBlacklist.findMany({
        where, skip, take, orderBy: { createdAt: 'desc' },
        include: { addedBy: { select: { id: true, name: true } } },
      }),
      this.prisma.companyBlacklist.count({ where }),
    ]);
    return this.page(data, total, page, limit);
  }

  async addToBlacklist(companyId: number, userId: number, dto: any) {
    return this.prisma.companyBlacklist.create({
      data: {
        ownerCompanyId: companyId,
        companyName:    dto.companyName,
        companyCode:    dto.companyCode   ?? null,
        reason:         dto.reason,
        reasonFa:       dto.reasonFa      ?? null,
        severity:       (dto.severity ?? 'MEDIUM').toUpperCase() as any,
        status:         'ACTIVE' as any,
        tenderId:       dto.tenderId      ?? null,
        tenderTitle:    dto.tenderTitle   ?? null,
        addedById:      userId,
      },
      include: { addedBy: { select: { id: true, name: true } } },
    });
  }

  async appealBlacklist(companyId: number, id: number) {
    const entry = await this.prisma.companyBlacklist.findFirst({
      where: { id, ownerCompanyId: companyId },
    });
    if (!entry) throw new BadRequestException('Entry not found');
    return this.prisma.companyBlacklist.update({
      where: { id },
      data:  { status: 'APPEALING' as any },
    });
  }

  async removeFromBlacklist(companyId: number, id: number) {
    const entry = await this.prisma.companyBlacklist.findFirst({
      where: { id, ownerCompanyId: companyId },
    });
    if (!entry) throw new BadRequestException('Entry not found');
    return this.prisma.companyBlacklist.delete({ where: { id } });
  }
}
