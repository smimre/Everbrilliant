import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class FinanceService {
  constructor(private prisma: PrismaService) {}

  private paginate(query: any) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
    return { skip: (page - 1) * limit, take: limit, page, limit };
  }

  private async paginatedResponse<T>(data: T[], total: number, page: number, limit: number) {
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  // ── Invoices ──────────────────────────────
  async getInvoices(companyId: number, query: any) {
    const { skip, take, page, limit } = this.paginate(query);
    const where: Prisma.InvoiceWhereInput = {
      OR: [{ sellerCompanyId: companyId }, { buyerCompanyId: companyId }],
      ...(query.status && { status: query.status.toUpperCase() }),
      ...(query.search && {
        OR: [{ id: { contains: query.search, mode: 'insensitive' } }],
      }),
    };

    const [data, total] = await Promise.all([
      this.prisma.invoice.findMany({ where, skip, take, orderBy: { createdAt: 'desc' }, include: { items: true } }),
      this.prisma.invoice.count({ where }),
    ]);
    return this.paginatedResponse(data, total, page, limit);
  }

  async getInvoice(companyId: number, id: string) {
    const inv = await this.prisma.invoice.findFirst({
      where: { id, OR: [{ sellerCompanyId: companyId }, { buyerCompanyId: companyId }] },
      include: { items: true, payments: true, sellerCompany: true, buyerCompany: true },
    });
    if (!inv) throw new NotFoundException('Invoice not found');
    return inv;
  }

  async createInvoice(companyId: number, userId: number, dto: any) {
    const VAT = 9, TOL = 1;
    let subtotal = BigInt(0), discountTotal = BigInt(0), vatAmount = BigInt(0), tolAmount = BigInt(0);

    const items = dto.items.map((item: any, i: number) => {
      const qty = Number(item.qty);
      const unitPrice = BigInt(Math.round(Number(item.unitPrice)));
      const sub = BigInt(Math.round(qty * Number(unitPrice)));
      const disc = BigInt(Math.round(Number(sub) * (item.discountPct || 0) / 100));
      const net = sub - disc;
      const vat = BigInt(Math.round(Number(net) * VAT / 100));
      const tol = BigInt(Math.round(Number(net) * TOL / 100));
      subtotal += net;
      discountTotal += disc;
      vatAmount += vat;
      tolAmount += tol;
      return {
        row: i + 1, desc: item.desc, qty, unit: item.unit,
        unitPrice, discount: disc, discountPct: item.discountPct || 0,
        netPrice: net, subtotalRow: net,
        vatPct: VAT, tolPct: TOL, taxPct: VAT + TOL,
        vatAmount: vat, tolAmount: tol, taxAmount: vat + tol, totalRow: net + vat + tol,
        hsCode: item.hsCode,
      };
    });

    const taxAmount = vatAmount + tolAmount;
    const total = subtotal + taxAmount;
    const remaining = total;

    const date = new Date();
    const id = `TINV-${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2,'0')}${String(date.getDate()).padStart(2,'0')}-${Math.random().toString(36).slice(2,7).toUpperCase()}`;

    return this.prisma.invoice.create({
      data: {
        id,
        invoiceType: (dto.invoiceType || 'type1').toUpperCase() as any,
        sellerCompanyId: companyId,
        buyerCompanyId: dto.buyerCompanyId || companyId,
        requestId: dto.requestId,
        subtotal, discountTotal, vatAmount, tolAmount, taxAmount, total,
        paid: BigInt(0), remaining,
        status: 'DRAFT' as any,
        currency: dto.currency || 'IRR',
        issuedAt: dto.issuedAt,
        dueAt: dto.dueAt,
        note: dto.note,
        items: { create: items },
      },
      include: { items: true },
    });
  }

  async payInvoice(companyId: number, id: string, dto: any) {
    const inv = await this.getInvoice(companyId, id);
    const amount = BigInt(Math.round(Number(dto.amount)));
    const newPaid = BigInt(Number(inv.paid)) + amount;
    const newRemaining = BigInt(Number(inv.total)) - newPaid;
    const newStatus = newRemaining <= BigInt(0) ? 'PAID' : 'PARTIAL';

    await this.prisma.payment.create({
      data: { invoiceId: id, amount, currency: inv.currency,
        method: (dto.paymentMethod || 'BANK_TRANSFER').toUpperCase() as any,
        referenceNo: dto.referenceNo, paidAt: new Date() },
    });

    return this.prisma.invoice.update({
      where: { id }, data: { paid: newPaid, remaining: newRemaining > BigInt(0) ? newRemaining : BigInt(0), status: newStatus as any },
    });
  }

  // ── Employees ─────────────────────────────
  async getEmployees(companyId: number, query: any) {
    const { skip, take, page, limit } = this.paginate(query);
    const where: Prisma.EmployeeWhereInput = {
      companyId,
      ...(query.search && { name: { contains: query.search, mode: 'insensitive' } }),
    };
    const [data, total] = await Promise.all([
      this.prisma.employee.findMany({ where, skip, take, orderBy: { name: 'asc' } }),
      this.prisma.employee.count({ where }),
    ]);
    return this.paginatedResponse(data, total, page, limit);
  }

  async createEmployee(companyId: number, dto: any) {
    return this.prisma.employee.create({
      data: { ...dto, companyId, baseSalary: BigInt(dto.baseSalary || 0) },
    });
  }

  // ── Inventory ─────────────────────────────
  async getInventory(companyId: number, query: any) {
    const { skip, take, page, limit } = this.paginate(query);
    const where: Prisma.InventoryItemWhereInput = {
      companyId,
      ...(query.search && { product: { contains: query.search, mode: 'insensitive' } }),
      ...(query.category && { category: query.category }),
    };
    const [data, total] = await Promise.all([
      this.prisma.inventoryItem.findMany({ where, skip, take, orderBy: { product: 'asc' } }),
      this.prisma.inventoryItem.count({ where }),
    ]);
    return this.paginatedResponse(data, total, page, limit);
  }

  async addInventory(companyId: number, dto: any) {
    return this.prisma.inventoryItem.create({
      data: { ...dto, companyId, qty: Number(dto.qty), minQty: Number(dto.minQty || 0) },
    });
  }

  async stockMove(companyId: number, itemId: string, type: 'in' | 'out', qty: number, userId: number, ref?: string) {
    const item = await this.prisma.inventoryItem.findFirst({ where: { id: itemId, companyId } });
    if (!item) throw new NotFoundException('Item not found');

    const currentQty = Number(item.qty);
    if (type === 'out' && currentQty < qty) throw new BadRequestException('Insufficient stock');

    const newQty = type === 'in' ? currentQty + qty : currentQty - qty;

    await this.prisma.inventoryMovement.create({
      data: { itemId, type, qty, balanceAfter: newQty, ref, createdById: userId },
    });

    return this.prisma.inventoryItem.update({ where: { id: itemId }, data: { qty: newQty } });
  }
}
