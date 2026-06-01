// ══════════════════════════════════════════════════════════════
// EVERBRILLIANT — Realtime Service
// Bridges business events → WebSocket emissions
// ══════════════════════════════════════════════════════════════
import { Injectable, Logger } from '@nestjs/common';
import { EventsGateway, WS_EVENTS } from './events.gateway';
import { PrismaService } from '../prisma/prisma.service';

export interface NotificationPayload {
  userId: number;
  companyId: number;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR' | 'REQUEST' | 'APPROVAL' | 'PAYMENT' | 'CONTRACT' | 'SYSTEM';
  title: string;
  titleFa?: string;
  message: string;
  messageFa?: string;
  link?: string;
  entityType?: string;
  entityId?: string;
}

@Injectable()
export class RealtimeService {
  private readonly logger = new Logger('RealtimeService');

  constructor(
    private gateway: EventsGateway,
    private prisma: PrismaService,
  ) {}

  // ── Notifications ─────────────────────────────────────────────

  async notifyUser(payload: NotificationPayload) {
    // Save to DB
    const notification = await this.prisma.notification.create({
      data: {
        userId: payload.userId,
        companyId: payload.companyId,
        type: payload.type as any,
        title: payload.title,
        titleFa: payload.titleFa,
        message: payload.message,
        messageFa: payload.messageFa,
        link: payload.link,
        entityType: payload.entityType,
        entityId: payload.entityId,
      },
    });

    // Emit via WebSocket
    this.gateway.emitToUser(payload.userId, WS_EVENTS.NOTIFICATION, {
      id: notification.id,
      type: payload.type,
      title: payload.title,
      titleFa: payload.titleFa,
      message: payload.message,
      messageFa: payload.messageFa,
      link: payload.link,
      createdAt: notification.createdAt,
    });

    this.logger.log(`📬 Notification → user:${payload.userId}: ${payload.title}`);
    return notification;
  }

  async notifyCompany(companyId: number, payload: Omit<NotificationPayload, 'userId' | 'companyId'>) {
    const users = await this.prisma.user.findMany({
      where: { companyId, isActive: true },
      select: { id: true },
    });

    await Promise.all(users.map(u =>
      this.notifyUser({ ...payload, userId: u.id, companyId })
    ));
  }

  // ── Trade Requests ────────────────────────────────────────────

  async onRequestCreated(request: any, buyerCompanyId: number, sellerCompanyId?: number) {
    // Notify buyer's team
    this.gateway.emitToCompany(buyerCompanyId, WS_EVENTS.REQUEST_UPDATE, {
      action: 'created',
      requestId: request.id,
      product: request.product,
      status: request.status,
    });

    // If seller is known, notify them
    if (sellerCompanyId) {
      await this.notifyCompany(sellerCompanyId, {
        type: 'REQUEST',
        title: 'New Trade Request',
        titleFa: 'درخواست تجاری جدید',
        message: `New request for ${request.product} (${request.qty} ${request.unit})`,
        messageFa: `درخواست جدید برای ${request.product} (${request.qty} ${request.unit})`,
        link: `/dashboard/requests/${request.id}`,
        entityType: 'request',
        entityId: request.id,
      });
    }
  }

  async onRequestStatusChanged(request: any, newStatus: string, companyId: number) {
    this.gateway.emitToCompany(companyId, WS_EVENTS.REQUEST_UPDATE, {
      action: 'status_changed',
      requestId: request.id,
      product: request.product,
      status: newStatus,
    });
  }

  // ── Approvals ─────────────────────────────────────────────────

  async onApprovalRequired(workflowRequest: any, approverId: number, companyId: number) {
    await this.notifyUser({
      userId: approverId,
      companyId,
      type: 'APPROVAL',
      title: 'Approval Required',
      titleFa: 'نیاز به تأیید',
      message: `"${workflowRequest.title}" requires your approval`,
      messageFa: `"${workflowRequest.title}" نیاز به تأیید شما دارد`,
      link: `/dashboard/automation/requests/${workflowRequest.id}`,
      entityType: 'workflow_request',
      entityId: workflowRequest.id,
    });

    this.gateway.emitToUser(approverId, WS_EVENTS.APPROVAL_UPDATE, {
      action: 'required',
      requestId: workflowRequest.id,
      title: workflowRequest.title,
    });
  }

  async onApprovalDecided(workflowRequest: any, approved: boolean, companyId: number) {
    // Notify requester
    await this.notifyUser({
      userId: workflowRequest.requesterId,
      companyId,
      type: approved ? 'SUCCESS' : 'WARNING',
      title: approved ? 'Request Approved' : 'Request Rejected',
      titleFa: approved ? 'درخواست تأیید شد' : 'درخواست رد شد',
      message: `Your request "${workflowRequest.title}" has been ${approved ? 'approved' : 'rejected'}`,
      messageFa: `درخواست "${workflowRequest.title}" ${approved ? 'تأیید' : 'رد'} شد`,
      link: `/dashboard/automation/requests/${workflowRequest.id}`,
      entityType: 'workflow_request',
      entityId: workflowRequest.id,
    });

    this.gateway.emitToUser(workflowRequest.requesterId, WS_EVENTS.APPROVAL_UPDATE, {
      action: approved ? 'approved' : 'rejected',
      requestId: workflowRequest.id,
    });
  }

  // ── Contracts ─────────────────────────────────────────────────

  async onContractSigned(contract: any, signerCompanyId: number, otherCompanyId: number) {
    const isFullySigned = contract.signedBuyer && contract.signedSeller;

    this.gateway.emitToCompany(signerCompanyId, WS_EVENTS.CONTRACT_UPDATE, {
      action: 'signed',
      contractId: contract.id,
      status: contract.status,
      fullyExecuted: isFullySigned,
    });

    this.gateway.emitToCompany(otherCompanyId, WS_EVENTS.CONTRACT_UPDATE, {
      action: 'counterpart_signed',
      contractId: contract.id,
      status: contract.status,
    });

    await this.notifyCompany(otherCompanyId, {
      type: isFullySigned ? 'SUCCESS' : 'INFO',
      title: isFullySigned ? 'Contract Fully Executed!' : 'Contract Partially Signed',
      titleFa: isFullySigned ? 'قرارداد کاملاً امضا شد!' : 'قرارداد امضا شد',
      message: `Contract "${contract.title}" ${isFullySigned ? 'is now active' : 'awaiting your signature'}`,
      messageFa: `قرارداد "${contract.title}" ${isFullySigned ? 'فعال شد' : 'منتظر امضای شماست'}`,
      link: `/dashboard/contracts/${contract.id}`,
      entityType: 'contract',
      entityId: contract.id,
    });
  }

  // ── Invoices ──────────────────────────────────────────────────

  async onInvoiceCreated(invoice: any, buyerCompanyId: number) {
    await this.notifyCompany(buyerCompanyId, {
      type: 'PAYMENT',
      title: 'New Invoice Received',
      titleFa: 'فاکتور جدید دریافت شد',
      message: `Invoice ${invoice.id} for ${Number(invoice.total).toLocaleString()} IRR`,
      messageFa: `فاکتور ${invoice.id} به مبلغ ${Number(invoice.total).toLocaleString()} ریال`,
      link: `/dashboard/finance/invoices/${invoice.id}`,
      entityType: 'invoice',
      entityId: invoice.id,
    });

    this.gateway.emitToCompany(buyerCompanyId, WS_EVENTS.INVOICE_UPDATE, {
      action: 'created',
      invoiceId: invoice.id,
      total: invoice.total,
      status: invoice.status,
    });
  }

  async onInvoicePaid(invoice: any, sellerCompanyId: number) {
    await this.notifyCompany(sellerCompanyId, {
      type: 'SUCCESS',
      title: 'Payment Received!',
      titleFa: 'پرداخت دریافت شد!',
      message: `Invoice ${invoice.id} has been paid`,
      messageFa: `فاکتور ${invoice.id} پرداخت شد`,
      link: `/dashboard/finance/invoices/${invoice.id}`,
      entityType: 'invoice',
      entityId: invoice.id,
    });

    this.gateway.emitToCompany(sellerCompanyId, WS_EVENTS.INVOICE_UPDATE, {
      action: 'paid',
      invoiceId: invoice.id,
      status: 'PAID',
    });
  }

  // ── Live Bidding ──────────────────────────────────────────────

  async onBidPlaced(tender: any, bid: any, bidderCompanyId: number) {
    const payload = {
      tenderId: tender.id,
      bidId: bid.id,
      bidderCompanyId,
      totalPrice: bid.totalPrice,
      currency: bid.currency,
      bidsCount: (tender.bidsCount || 0) + 1,
      timestamp: new Date().toISOString(),
    };

    // Broadcast to all tender room viewers (anonymized)
    this.gateway.emitToTender(tender.id, WS_EVENTS.TENDER_BID_PLACED, {
      tenderId: tender.id,
      bidsCount: payload.bidsCount,
      latestBidTime: payload.timestamp,
      // Don't reveal who bid
    });

    // Notify tender owner
    await this.notifyCompany(tender.companyId, {
      type: 'INFO',
      title: 'New Bid Received',
      titleFa: 'پیشنهاد جدید دریافت شد',
      message: `New bid on "${tender.title}"`,
      messageFa: `پیشنهاد جدید برای "${tender.title}"`,
      link: `/dashboard/tenders/${tender.id}`,
      entityType: 'tender',
      entityId: tender.id,
    });

    this.logger.log(`🔨 Bid on tender:${tender.id} from company:${bidderCompanyId}`);
  }

  onTenderOpened(tender: any) {
    this.gateway.registerTender(tender.id, new Date(tender.endDate), tender.title);
    this.gateway.broadcast(WS_EVENTS.TENDER_UPDATE, {
      action: 'opened',
      tenderId: tender.id,
      title: tender.title,
      endDate: tender.endDate,
    });
  }

  onTenderClosed(tender: any) {
    this.gateway.unregisterTender(tender.id);
    this.gateway.emitToTender(tender.id, WS_EVENTS.TENDER_UPDATE, {
      action: 'closed',
      tenderId: tender.id,
      status: 'CLOSED',
    });
  }

  // ── System Alerts ─────────────────────────────────────────────

  async systemAlert(message: string, type: 'INFO' | 'WARNING' | 'ERROR' = 'INFO') {
    this.gateway.broadcast(WS_EVENTS.NOTIFICATION, {
      type, title: 'System Alert', message, isSystem: true,
      createdAt: new Date().toISOString(),
    });
  }

  // ── Stats ─────────────────────────────────────────────────────
  getRealtimeStats() {
    return this.gateway.getStats();
  }
}
