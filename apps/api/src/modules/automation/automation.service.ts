import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class AutomationService {
  constructor(private prisma: PrismaService) {}

  private paginate(q: any) {
    const page = Math.max(1, Number(q.page) || 1);
    const limit = Math.min(100, Number(q.limit) || 20);
    return { skip: (page - 1) * limit, take: limit, page, limit };
  }

  private page<T>(data: T[], total: number, page: number, limit: number) {
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  // ── Letters ───────────────────────────────
  async getLetters(companyId: number, q: any) {
    const { skip, take, page, limit } = this.paginate(q);
    const where: Prisma.LetterWhereInput = {
      companyId,
      ...(q.type && { type: q.type.toUpperCase() as any }),
      ...(q.search && {
        OR: [{ title: { contains: q.search, mode: 'insensitive' } }, { letterNo: { contains: q.search } }],
      }),
    };
    const [data, total] = await Promise.all([
      this.prisma.letter.findMany({ where, skip, take, orderBy: { createdAt: 'desc' }, include: { createdBy: { select: { id:true, name:true } } } }),
      this.prisma.letter.count({ where }),
    ]);
    return this.page(data, total, page, limit);
  }

  async createLetter(companyId: number, userId: number, dto: any) {
    if (!dto.type) throw new BadRequestException('type is required (INCOMING, OUTGOING, INTERNAL)');
    const count = await this.prisma.letter.count({ where: { companyId } });
    const letterNo = `${new Date().getFullYear()}/${String(count + 1).padStart(4, '0')}`;
    return this.prisma.letter.create({
      data: {
        ...dto, companyId, createdById: userId, letterNo,
        type: dto.type.toUpperCase() as any,
        priority: (dto.priority || 'NORMAL').toUpperCase() as any,
        status: 'DRAFT' as any,
        cc: dto.cc || [],
      },
    });
  }

  async archiveLetter(companyId: number, id: string) {
    const letter = await this.prisma.letter.findFirst({ where: { id, companyId } });
    if (!letter) throw new NotFoundException();
    return this.prisma.letter.update({ where: { id }, data: { status: 'ARCHIVED', archivedAt: new Date() } });
  }

  // ── Workflow Requests ─────────────────────
  async getWorkflowRequests(companyId: number, q: any) {
    const { skip, take, page, limit } = this.paginate(q);
    const where: Prisma.WorkflowRequestWhereInput = {
      companyId,
      ...(q.status && { status: q.status.toUpperCase() as any }),
    };
    const [data, total] = await Promise.all([
      this.prisma.workflowRequest.findMany({
        where, skip, take, orderBy: { createdAt: 'desc' },
        include: { requester: { select: { id:true, name:true } }, approvals: { include: { approver: { select: { id:true, name:true } } } } },
      }),
      this.prisma.workflowRequest.count({ where }),
    ]);
    return this.page(data, total, page, limit);
  }

  async createWorkflowRequest(companyId: number, userId: number, dto: any) {
    if (!dto.type) throw new BadRequestException('type is required (LEAVE, EXPENSE, PURCHASE, ADVANCE, OVERTIME, MISSION)');
    const { approverId, ...rest } = dto;
    return this.prisma.workflowRequest.create({
      data: {
        ...rest, companyId, requesterId: userId,
        type: dto.type.toUpperCase() as any,
        status: 'PENDING' as any,
        ...(dto.amount && { amount: BigInt(dto.amount) }),
        ...(approverId && {
          approvals: { create: [{ approverId, step: 1, action: 'PENDING' as any }] },
        }),
      },
      include: { approvals: true },
    });
  }

  async approveRequest(companyId: number, userId: number, requestId: string, comment?: string) {
    const approval = await this.prisma.approval.findFirst({
      where: { requestId, approverId: userId, action: 'PENDING' },
    });
    if (!approval) throw new NotFoundException('No pending approval found');

    await this.prisma.approval.update({
      where: { id: approval.id },
      data: { action: 'APPROVED', comment, decidedAt: new Date() },
    });

    const pending = await this.prisma.approval.count({ where: { requestId, action: 'PENDING' } });
    if (pending === 0) {
      await this.prisma.workflowRequest.update({ where: { id: requestId }, data: { status: 'APPROVED', approvedAt: new Date() } });
    }
    return { success: true };
  }

  async rejectRequest(companyId: number, userId: number, requestId: string, comment?: string) {
    await this.prisma.approval.updateMany({
      where: { requestId, approverId: userId, action: 'PENDING' },
      data: { action: 'REJECTED', comment, decidedAt: new Date() },
    });
    await this.prisma.workflowRequest.update({
      where: { id: requestId },
      data: { status: 'REJECTED', rejectedAt: new Date() },
    });
    return { success: true };
  }

  // ── Meetings ──────────────────────────────
  async getMeetings(companyId: number, q: any) {
    const { skip, take, page, limit } = this.paginate(q);
    const where: Prisma.MeetingWhereInput = { companyId };
    const [data, total] = await Promise.all([
      this.prisma.meeting.findMany({ where, skip, take, orderBy: { date: 'desc' } }),
      this.prisma.meeting.count({ where }),
    ]);
    return this.page(data, total, page, limit);
  }

  async createMeeting(companyId: number, userId: number, dto: any) {
    return this.prisma.meeting.create({
      data: {
        ...dto, companyId, createdById: userId,
        type: (dto.type || 'IN_PERSON').toUpperCase() as any,
        status: 'SCHEDULED' as any,
        attendees: dto.attendees || [],
      },
    });
  }

  async addMinutes(companyId: number, id: string, minutes: string) {
    const meeting = await this.prisma.meeting.findFirst({ where: { id, companyId } });
    if (!meeting) throw new NotFoundException();
    return this.prisma.meeting.update({ where: { id }, data: { minutes, status: 'COMPLETED' } });
  }
}
