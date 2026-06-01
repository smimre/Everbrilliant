// ══════════════════════════════════════════════════════════════
// EVERBRILLIANT — WebSocket Gateway
// Real-time: notifications, approvals, bidding, presence
// ══════════════════════════════════════════════════════════════
import {
  WebSocketGateway, WebSocketServer, SubscribeMessage,
  OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit,
  MessageBody, ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable, Logger } from '@nestjs/common';
import { AuthService } from '../modules/auth/auth.service';

// ── Event Names ───────────────────────────────────────────────
export const WS_EVENTS = {
  // Server → Client
  NOTIFICATION:       'notification',
  APPROVAL_UPDATE:    'approval:update',
  REQUEST_UPDATE:     'request:update',
  CONTRACT_UPDATE:    'contract:update',
  BID_UPDATE:         'bid:update',
  TENDER_UPDATE:      'tender:update',
  INVOICE_UPDATE:     'invoice:update',
  PRESENCE_JOIN:      'presence:join',
  PRESENCE_LEAVE:     'presence:leave',
  PRESENCE_LIST:      'presence:list',
  TENDER_BID_PLACED:  'tender:bid_placed',
  TENDER_COUNTDOWN:   'tender:countdown',
  TYPING:             'typing',
  ERROR:              'error',

  // Client → Server
  JOIN_COMPANY:       'join:company',
  JOIN_TENDER:        'join:tender',
  LEAVE_TENDER:       'leave:tender',
  MARK_ONLINE:        'presence:online',
  START_TYPING:       'typing:start',
  STOP_TYPING:        'typing:stop',
} as const;

// ── Presence Tracking ─────────────────────────────────────────
interface PresenceUser {
  userId: number;
  name: string;
  companyId: number;
  socketId: string;
  status: 'online' | 'away' | 'busy';
  currentPage?: string;
  lastSeen: Date;
}

// ── Socket Session ────────────────────────────────────────────
interface SocketSession {
  userId: number;
  companyId: number;
  name: string;
  role: string;
}

@Injectable()
@WebSocketGateway({
  cors: {
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3001'],
    credentials: true,
  },
  namespace: '/',
  transports: ['websocket', 'polling'],
})
export class EventsGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private readonly logger = new Logger('EventsGateway');

  // ── State ────────────────────────────────────────────────────
  private sessions = new Map<string, SocketSession>();        // socketId → session
  private userSockets = new Map<number, Set<string>>();       // userId → Set<socketId>
  private companySockets = new Map<number, Set<string>>();    // companyId → Set<socketId>
  private tenderRooms = new Map<string, Set<string>>();       // tenderId → Set<socketId>
  private presence = new Map<number, PresenceUser>();         // userId → PresenceUser
  private typingTimers = new Map<string, NodeJS.Timeout>();   // `room:userId` → timer

  constructor(private authService: AuthService) {}

  afterInit(server: Server) {
    this.logger.log('🔌 WebSocket Gateway initialized');

    // Tender countdown broadcaster
    setInterval(() => {
      this.broadcastTenderCountdowns();
    }, 1000);

    // Ping/pong for presence
    setInterval(() => {
      this.cleanupStalePresence();
    }, 30_000);
  }

  // ── Connection ────────────────────────────────────────────────
  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth?.token ||
        client.handshake.headers?.authorization?.replace('Bearer ', '');

      if (!token) {
        client.emit(WS_EVENTS.ERROR, { message: 'No token provided' });
        client.disconnect();
        return;
      }

      const user = await this.authService.validateToken(token);
      if (!user) {
        client.emit(WS_EVENTS.ERROR, { message: 'Invalid token' });
        client.disconnect();
        return;
      }

      const session: SocketSession = {
        userId: user.id,
        companyId: (user as any).companyId,
        name: user.name,
        role: (user as any).role?.name || 'viewer',
      };

      // Register session
      this.sessions.set(client.id, session);

      // Track user sockets
      if (!this.userSockets.has(session.userId)) {
        this.userSockets.set(session.userId, new Set());
      }
      this.userSockets.get(session.userId)!.add(client.id);

      // Track company sockets
      if (!this.companySockets.has(session.companyId)) {
        this.companySockets.set(session.companyId, new Set());
      }
      this.companySockets.get(session.companyId)!.add(client.id);

      // Auto-join company room
      client.join(`company:${session.companyId}`);

      // Update presence
      this.presence.set(session.userId, {
        userId: session.userId,
        name: session.name,
        companyId: session.companyId,
        socketId: client.id,
        status: 'online',
        lastSeen: new Date(),
      });

      // Notify company of new presence
      this.server.to(`company:${session.companyId}`).emit(WS_EVENTS.PRESENCE_JOIN, {
        userId: session.userId,
        name: session.name,
        status: 'online',
      });

      // Send current presence list to new user
      const companyPresence = this.getCompanyPresence(session.companyId);
      client.emit(WS_EVENTS.PRESENCE_LIST, companyPresence);

      this.logger.log(`✅ Connected: ${session.name} (${client.id})`);
    } catch (err) {
      this.logger.error('Connection error:', err);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const session = this.sessions.get(client.id);
    if (!session) return;

    // Clean up
    this.sessions.delete(client.id);
    this.userSockets.get(session.userId)?.delete(client.id);
    this.companySockets.get(session.companyId)?.delete(client.id);

    // If user has no more sockets, remove from presence
    if (!this.userSockets.get(session.userId)?.size) {
      this.presence.delete(session.userId);
      this.server.to(`company:${session.companyId}`).emit(WS_EVENTS.PRESENCE_LEAVE, {
        userId: session.userId,
        name: session.name,
      });
    }

    this.logger.log(`❌ Disconnected: ${session.name} (${client.id})`);
  }

  // ── Message Handlers ──────────────────────────────────────────
  @SubscribeMessage(WS_EVENTS.JOIN_TENDER)
  handleJoinTender(@ConnectedSocket() client: Socket, @MessageBody() data: { tenderId: string }) {
    const session = this.sessions.get(client.id);
    if (!session) return;

    client.join(`tender:${data.tenderId}`);

    if (!this.tenderRooms.has(data.tenderId)) {
      this.tenderRooms.set(data.tenderId, new Set());
    }
    this.tenderRooms.get(data.tenderId)!.add(client.id);

    // Send current viewer count
    const viewers = this.tenderRooms.get(data.tenderId)!.size;
    this.server.to(`tender:${data.tenderId}`).emit(WS_EVENTS.TENDER_UPDATE, {
      tenderId: data.tenderId, viewers,
    });

    return { joined: true, viewers };
  }

  @SubscribeMessage(WS_EVENTS.LEAVE_TENDER)
  handleLeaveTender(@ConnectedSocket() client: Socket, @MessageBody() data: { tenderId: string }) {
    client.leave(`tender:${data.tenderId}`);
    this.tenderRooms.get(data.tenderId)?.delete(client.id);
    return { left: true };
  }

  @SubscribeMessage(WS_EVENTS.MARK_ONLINE)
  handleMarkOnline(@ConnectedSocket() client: Socket, @MessageBody() data: { page?: string; status?: 'online' | 'away' | 'busy' }) {
    const session = this.sessions.get(client.id);
    if (!session) return;

    const presence = this.presence.get(session.userId);
    if (presence) {
      presence.lastSeen = new Date();
      presence.currentPage = data.page;
      if (data.status) presence.status = data.status;
    }
    return { ok: true };
  }

  @SubscribeMessage(WS_EVENTS.START_TYPING)
  handleStartTyping(@ConnectedSocket() client: Socket, @MessageBody() data: { room: string }) {
    const session = this.sessions.get(client.id);
    if (!session) return;

    const key = `${data.room}:${session.userId}`;
    client.to(data.room).emit(WS_EVENTS.TYPING, {
      userId: session.userId, name: session.name, isTyping: true,
    });

    // Auto-stop after 3s
    if (this.typingTimers.has(key)) clearTimeout(this.typingTimers.get(key)!);
    this.typingTimers.set(key, setTimeout(() => {
      client.to(data.room).emit(WS_EVENTS.TYPING, {
        userId: session.userId, name: session.name, isTyping: false,
      });
      this.typingTimers.delete(key);
    }, 3000));
  }

  @SubscribeMessage(WS_EVENTS.STOP_TYPING)
  handleStopTyping(@ConnectedSocket() client: Socket, @MessageBody() data: { room: string }) {
    const session = this.sessions.get(client.id);
    if (!session) return;

    const key = `${data.room}:${session.userId}`;
    if (this.typingTimers.has(key)) {
      clearTimeout(this.typingTimers.get(key)!);
      this.typingTimers.delete(key);
    }

    client.to(data.room).emit(WS_EVENTS.TYPING, {
      userId: session.userId, name: session.name, isTyping: false,
    });
  }

  // ── Emit helpers ──────────────────────────────────────────────

  /** Send notification to a specific user */
  emitToUser(userId: number, event: string, data: unknown) {
    const sockets = this.userSockets.get(userId);
    if (!sockets?.size) return;
    sockets.forEach(socketId => {
      this.server.to(socketId).emit(event, data);
    });
  }

  /** Broadcast to all users in a company */
  emitToCompany(companyId: number, event: string, data: unknown) {
    this.server.to(`company:${companyId}`).emit(event, data);
  }

  /** Broadcast to all users in a tender room */
  emitToTender(tenderId: string, event: string, data: unknown) {
    this.server.to(`tender:${tenderId}`).emit(event, data);
  }

  /** Broadcast to ALL connected clients (system alerts) */
  broadcast(event: string, data: unknown) {
    this.server.emit(event, data);
  }

  // ── Presence ──────────────────────────────────────────────────
  getCompanyPresence(companyId: number): PresenceUser[] {
    return Array.from(this.presence.values())
      .filter(p => p.companyId === companyId);
  }

  getOnlineUserIds(companyId: number): number[] {
    return this.getCompanyPresence(companyId).map(p => p.userId);
  }

  isUserOnline(userId: number): boolean {
    return this.presence.has(userId);
  }

  private cleanupStalePresence() {
    const threshold = new Date(Date.now() - 60_000);
    this.presence.forEach((p, userId) => {
      if (p.lastSeen < threshold) {
        this.presence.delete(userId);
        this.server.to(`company:${p.companyId}`).emit(WS_EVENTS.PRESENCE_LEAVE, {
          userId, name: p.name,
        });
      }
    });
  }

  // ── Tender Countdown ──────────────────────────────────────────
  private activeTenders = new Map<string, { endDate: Date; title: string }>();

  registerTender(tenderId: string, endDate: Date, title: string) {
    this.activeTenders.set(tenderId, { endDate, title });
  }

  unregisterTender(tenderId: string) {
    this.activeTenders.delete(tenderId);
  }

  private broadcastTenderCountdowns() {
    const now = Date.now();
    this.activeTenders.forEach((tender, tenderId) => {
      const remaining = tender.endDate.getTime() - now;
      if (remaining <= 0) {
        this.emitToTender(tenderId, WS_EVENTS.TENDER_UPDATE, {
          tenderId, status: 'closed', remaining: 0,
        });
        this.activeTenders.delete(tenderId);
        return;
      }

      // Only broadcast every 10s unless < 60s remaining
      if (remaining > 60_000 && now % 10_000 > 1000) return;

      this.emitToTender(tenderId, WS_EVENTS.TENDER_COUNTDOWN, {
        tenderId, remaining: Math.floor(remaining / 1000),
        urgency: remaining < 60_000 ? 'critical' : remaining < 300_000 ? 'warning' : 'normal',
      });
    });
  }

  // ── Stats ─────────────────────────────────────────────────────
  getStats() {
    return {
      totalConnected: this.sessions.size,
      companies: this.companySockets.size,
      tenderRooms: this.tenderRooms.size,
      presenceCount: this.presence.size,
    };
  }
}
