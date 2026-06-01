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
}
