import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getStats(companyId: number) {
    const now = new Date();
    const mtdStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const companyFilter = (a: string, b: string) => ({
      OR: [{ [`${a}Id`]: companyId }, { [`${b}Id`]: companyId }],
    });

    const [
      pendingRequests,
      activeContracts,
      unpaidInvoices,
      overdueCount,
      revenueMTD,
      activeConnections,
      recentActivity,
    ] = await Promise.all([
      this.prisma.tradeRequest.count({
        where: { ...companyFilter('buyerCompany', 'sellerCompany'), status: 'PENDING' },
      }),
      this.prisma.contract.count({
        where: { ...companyFilter('buyerCompany', 'sellerCompany'), status: 'ACTIVE' },
      }),
      this.prisma.invoice.aggregate({
        where: {
          ...companyFilter('buyerCompany', 'sellerCompany'),
          status: { in: ['SENT', 'PARTIAL', 'OVERDUE'] },
        },
        _count: true,
        _sum: { remaining: true },
      }),
      this.prisma.invoice.count({
        where: { ...companyFilter('buyerCompany', 'sellerCompany'), status: 'OVERDUE' },
      }),
      this.prisma.invoice.aggregate({
        where: {
          sellerCompanyId: companyId,
          status: { in: ['PAID', 'PARTIAL'] },
          createdAt: { gte: mtdStart },
        },
        _sum: { paid: true },
      }),
      this.prisma.companyConnection.count({
        where: {
          OR: [{ companyAId: companyId }, { companyBId: companyId }],
          status: 'active',
        },
      }),
      this.prisma.auditLog.findMany({
        where: { companyId },
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: { action: true, entityType: true, module: true, description: true, createdAt: true, userId: true, user: { select: { name: true } } },
      }),
    ]);

    return {
      pendingRequests,
      activeContracts,
      unpaidInvoicesCount: unpaidInvoices._count,
      unpaidAmount: Number(unpaidInvoices._sum.remaining ?? 0),
      overdueCount,
      totalRevenueMTD: Number(revenueMTD._sum.paid ?? 0),
      activeConnections,
      recentActivity,
    };
  }
}
