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

  // ── Tasks ─────────────────────────────────
  async getTasks(companyId: number, q: any) {
    const { skip, take, page, limit } = this.paginate(q);
    const where: any = {
      companyId,
      ...(q.status && { status: q.status }),
    };
    const [data, total] = await Promise.all([
      this.prisma.task.findMany({ where, skip, take, orderBy: { createdAt: 'desc' } }),
      this.prisma.task.count({ where }),
    ]);
    return this.page(data, total, page, limit);
  }

  async createTask(companyId: number, userId: number, dto: any) {
    return this.prisma.task.create({
      data: {
        companyId, createdById: userId,
        title: dto.title,
        description: dto.description || null,
        assigneeName: dto.assignee || null,
        priority: dto.priority || 'normal',
        status: 'pending',
        progress: 0,
        tag: dto.tag || null,
        dueStr: dto.due || null,
      },
    });
  }

  async updateTask(companyId: number, id: string, dto: any) {
    const existing = await this.prisma.task.findFirst({ where: { id, companyId } });
    if (!existing) throw new NotFoundException();
    return this.prisma.task.update({
      where: { id },
      data: {
        ...(dto.status !== undefined && { status: dto.status }),
        ...(dto.progress !== undefined && { progress: dto.progress }),
        ...(dto.assigneeName !== undefined && { assigneeName: dto.assigneeName }),
        ...(dto.priority !== undefined && { priority: dto.priority }),
        ...(dto.tag !== undefined && { tag: dto.tag }),
        ...(dto.dueStr !== undefined && { dueStr: dto.dueStr }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.status === 'done' && { completedAt: new Date() }),
        ...(dto.status === 'pending' && { completedAt: null }),
      },
    });
  }

  // ── Documents ─────────────────────────────
  async getDocuments(companyId: number, q: any) {
    const { skip, take, page, limit } = this.paginate(q);
    const where: any = {
      companyId,
      isArchived: false,
      ...(q.category && { category: q.category }),
      ...(q.search && {
        OR: [
          { title: { contains: q.search, mode: 'insensitive' } },
          { category: { contains: q.search, mode: 'insensitive' } },
        ],
      }),
    };
    const [data, total] = await Promise.all([
      this.prisma.document.findMany({ where, skip, take, orderBy: { createdAt: 'desc' } }),
      this.prisma.document.count({ where }),
    ]);
    return this.page(data, total, page, limit);
  }

  async createDocument(companyId: number, userId: number, dto: any) {
    return this.prisma.document.create({
      data: {
        companyId, createdById: userId,
        title: dto.title,
        type: dto.type || 'pdf',
        category: dto.category || 'سایر',
        version: dto.version || '1.0',
        confidential: dto.confidential || false,
        tags: dto.tags || [],
        content: dto.description || dto.content || null,
        uploaderName: dto.uploaderName || null,
        fileSize: dto.fileSize || null,
      },
    });
  }

  // ── Workflow Templates ─────────────────────
  async getWorkflowTemplates(companyId: number) {
    const data = await this.prisma.workflowTemplate.findMany({
      where: { companyId },
      include: {
        steps: { orderBy: { stepOrder: 'asc' } },
        instances: { orderBy: { createdAt: 'desc' } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return data;
  }

  async createWorkflowTemplate(companyId: number, dto: any) {
    const steps = (dto.steps || []).map((s: any, i: number) => ({
      name: s.name || `Step ${i + 1}`,
      assigneeName: s.user || null,
      stepOrder: i,
    }));
    return this.prisma.workflowTemplate.create({
      data: {
        companyId, title: dto.title,
        icon: dto.icon || '⚙️',
        mode: dto.mode || 'sequential',
        active: true,
        steps: { create: steps },
      },
      include: { steps: { orderBy: { stepOrder: 'asc' } }, instances: true },
    });
  }

  async startWorkflowInstance(companyId: number, templateId: string, dto: any) {
    const tpl = await this.prisma.workflowTemplate.findFirst({ where: { id: templateId, companyId } });
    if (!tpl) throw new NotFoundException();
    return this.prisma.workflowInstance.create({
      data: {
        templateId, companyId,
        title: dto.title,
        status: 'inprog',
        currentStep: 0,
        startDate: new Date().toLocaleDateString('fa-IR'),
      },
    });
  }

  async approveWorkflowStep(companyId: number, instanceId: string) {
    const inst = await this.prisma.workflowInstance.findFirst({
      where: { id: instanceId, companyId },
      include: { template: { include: { steps: true } } },
    });
    if (!inst) throw new NotFoundException();
    const nextStep = inst.currentStep + 1;
    const isDone = nextStep >= inst.template.steps.length;
    return this.prisma.workflowInstance.update({
      where: { id: instanceId },
      data: {
        currentStep: isDone ? inst.currentStep : nextStep,
        status: isDone ? 'done' : 'inprog',
        ...(isDone && { completedAt: new Date() }),
      },
    });
  }
}
