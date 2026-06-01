import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class TradingService {
  constructor(private prisma: PrismaService) {}

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
        product: dto.product, qty: dto.qty, unit: dto.unit,
        amountIRR: dto.amountIRR ? BigInt(dto.amountIRR) : undefined,
        currency: dto.currency || 'IRR',
        status: 'PENDING', priority: (dto.priority || 'NORMAL').toUpperCase() as any,
        deadline: dto.deadline ? new Date(dto.deadline) : undefined,
        note: dto.note, hsCode: dto.hsCode,
        createdById: userId,
      },
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

  // ── Quotes ────────────────────────────────
  async getQuotes(companyId: number, requestId: string) {
    return this.prisma.quote.findMany({
      where: { requestId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createQuote(companyId: number, userId: number, dto: any) {
    return this.prisma.quote.create({
      data: {
        requestId: dto.requestId,
        sellerCompanyId: companyId,
        unitPrice: dto.unitPrice, currency: dto.currency || 'IRR',
        totalPrice: dto.totalPrice,
        validUntil: dto.validUntil ? new Date(dto.validUntil) : undefined,
        deliveryDays: dto.deliveryDays,
        note: dto.note, status: 'PENDING', createdById: userId,
      },
    });
  }

  async acceptQuote(companyId: number, id: string) {
    const quote = await this.prisma.quote.findUnique({ where: { id }, include: { request: true } });
    if (!quote || quote.request.buyerCompanyId !== companyId) throw new ForbiddenException();
    await this.prisma.quote.updateMany({ where: { requestId: quote.requestId }, data: { status: 'REJECTED' } });
    const updated = await this.prisma.quote.update({ where: { id }, data: { status: 'ACCEPTED' } });
    await this.prisma.tradeRequest.update({ where: { id: quote.requestId }, data: { status: 'QUOTED', sellerCompanyId: quote.sellerCompanyId } });
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
  async getTenders(q: any) {
    const { skip, take, page, limit } = this.paginate(q);
    const where: Prisma.TenderWhereInput = {
      status: q.status ? q.status.toUpperCase() as any : 'OPEN',
      ...(q.type && { type: q.type.toUpperCase() as any }),
    };
    const [data, total] = await Promise.all([
      this.prisma.tender.findMany({
        where, skip, take, orderBy: { createdAt: 'desc' },
        include: { products: true, _count: { select: { bids: true } } },
      }),
      this.prisma.tender.count({ where }),
    ]);
    return this.page(data.map(t => ({ ...t, bidsCount: t._count.bids })), total, page, limit);
  }

  async createTender(companyId: number, userId: number, dto: any) {
    return this.prisma.tender.create({
      data: {
        type: dto.type.toUpperCase() as any,
        title: dto.title, companyId,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        status: 'DRAFT', createdById: userId,
        products: { create: dto.products },
      },
      include: { products: true },
    });
  }

  async placeBid(companyId: number, userId: number, tenderId: string, dto: any) {
    const tender = await this.prisma.tender.findUnique({ where: { id: tenderId } });
    if (!tender || tender.status !== 'OPEN') throw new BadRequestException('Tender not accepting bids');
    return this.prisma.bid.create({
      data: { tenderId, bidderId: userId, companyId, totalPrice: dto.totalPrice, currency: dto.currency || 'IRR', note: dto.note, status: 'PENDING' },
    });
  }
}

import { BadRequestException } from '@nestjs/common';
