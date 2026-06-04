import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class MessagingService {
  constructor(private prisma: PrismaService) {}

  private paginate(q: any) {
    const page = Math.max(1, Number(q.page) || 1);
    const limit = Math.min(100, Number(q.limit) || 20);
    return { skip: (page - 1) * limit, take: limit, page, limit };
  }

  private page<T>(data: T[], total: number, page: number, limit: number) {
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getInbox(companyId: number, q: any) {
    const { skip, take, page, limit } = this.paginate(q);
    const where: any = { toCompanyId: companyId };
    if (q.starred === 'true') where.isStarred = true;
    const [data, total] = await Promise.all([
      this.prisma.message.findMany({
        where, skip, take, orderBy: { createdAt: 'desc' },
        include: {
          fromCompany: { select: { id: true, name: true } },
          toCompany:   { select: { id: true, name: true } },
          fromUser:    { select: { id: true, name: true } },
        },
      }),
      this.prisma.message.count({ where }),
    ]);
    return this.page(data, total, page, limit);
  }

  async getSent(companyId: number, q: any) {
    const { skip, take, page, limit } = this.paginate(q);
    const [data, total] = await Promise.all([
      this.prisma.message.findMany({
        where: { fromCompanyId: companyId }, skip, take,
        orderBy: { createdAt: 'desc' },
        include: {
          fromCompany: { select: { id: true, name: true } },
          toCompany:   { select: { id: true, name: true } },
          fromUser:    { select: { id: true, name: true } },
        },
      }),
      this.prisma.message.count({ where: { fromCompanyId: companyId } }),
    ]);
    return this.page(data, total, page, limit);
  }

  async getUnreadCount(companyId: number) {
    const count = await this.prisma.message.count({
      where: { toCompanyId: companyId, isRead: false },
    });
    return { count };
  }

  async send(companyId: number, userId: number, dto: any) {
    if (!dto.toCompanyId) throw new BadRequestException('toCompanyId required');
    if (!dto.subject)     throw new BadRequestException('subject required');
    if (!dto.body)        throw new BadRequestException('body required');

    // Verify the recipient is a connected company
    const connection = await this.prisma.companyConnection.findFirst({
      where: {
        status: 'active',
        OR: [
          { companyAId: companyId, companyBId: Number(dto.toCompanyId) },
          { companyAId: Number(dto.toCompanyId), companyBId: companyId },
        ],
      },
    });
    if (!connection) throw new BadRequestException('Can only message connected companies');

    return this.prisma.message.create({
      data: {
        fromCompanyId: companyId,
        toCompanyId:   Number(dto.toCompanyId),
        fromUserId:    userId,
        subject:       dto.subject,
        body:          dto.body,
        type:          dto.type || 'message',
        refId:         dto.refId   || null,
        refType:       dto.refType || null,
      },
      include: {
        fromCompany: { select: { id: true, name: true } },
        toCompany:   { select: { id: true, name: true } },
        fromUser:    { select: { id: true, name: true } },
      },
    });
  }

  async markRead(companyId: number, id: string) {
    const msg = await this.prisma.message.findFirst({ where: { id, toCompanyId: companyId } });
    if (!msg) throw new NotFoundException();
    return this.prisma.message.update({ where: { id }, data: { isRead: true } });
  }

  async markAllRead(companyId: number) {
    await this.prisma.message.updateMany({
      where: { toCompanyId: companyId, isRead: false },
      data:  { isRead: true },
    });
    return { success: true };
  }

  async toggleStar(companyId: number, id: string) {
    const msg = await this.prisma.message.findFirst({
      where: { id, OR: [{ toCompanyId: companyId }, { fromCompanyId: companyId }] },
    });
    if (!msg) throw new NotFoundException();
    return this.prisma.message.update({ where: { id }, data: { isStarred: !msg.isStarred } });
  }

  async reply(companyId: number, userId: number, id: string, dto: any) {
    const original = await this.prisma.message.findFirst({
      where: { id, toCompanyId: companyId },
    });
    if (!original) throw new NotFoundException();
    if (!dto.body) throw new BadRequestException('body required');

    return this.prisma.message.create({
      data: {
        fromCompanyId: companyId,
        toCompanyId:   original.fromCompanyId,
        fromUserId:    userId,
        subject:       original.subject.startsWith('Re:') ? original.subject : `Re: ${original.subject}`,
        body:          dto.body,
        type:          'message',
        refId:         original.id,
        refType:       'reply',
      },
      include: {
        fromCompany: { select: { id: true, name: true } },
        toCompany:   { select: { id: true, name: true } },
        fromUser:    { select: { id: true, name: true } },
      },
    });
  }
}
