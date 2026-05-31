// ══════════════════════════════════════════════════════════════
// EVERBRILLIANT — Socket.IO Client
// ══════════════════════════════════════════════════════════════
import { io, Socket } from 'socket.io-client';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// ── Event constants (mirror server) ──────────────────────────
export const WS_EVENTS = {
  NOTIFICATION:      'notification',
  APPROVAL_UPDATE:   'approval:update',
  REQUEST_UPDATE:    'request:update',
  CONTRACT_UPDATE:   'contract:update',
  BID_UPDATE:        'bid:update',
  TENDER_UPDATE:     'tender:update',
  INVOICE_UPDATE:    'invoice:update',
  PRESENCE_JOIN:     'presence:join',
  PRESENCE_LEAVE:    'presence:leave',
  PRESENCE_LIST:     'presence:list',
  TENDER_BID_PLACED: 'tender:bid_placed',
  TENDER_COUNTDOWN:  'tender:countdown',
  TYPING:            'typing',
  ERROR:             'error',
  JOIN_TENDER:       'join:tender',
  LEAVE_TENDER:      'leave:tender',
  MARK_ONLINE:       'presence:online',
  START_TYPING:      'typing:start',
  STOP_TYPING:       'typing:stop',
} as const;

export type WsEvent = typeof WS_EVENTS[keyof typeof WS_EVENTS];

// ── Singleton Manager ─────────────────────────────────────────
class SocketManager {
  private socket: Socket | null = null;
  private token: string | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private listeners = new Map<string, Set<Function>>();
  private connectionState: 'disconnected' | 'connecting' | 'connected' = 'disconnected';

  connect(token: string): Socket {
    if (this.socket?.connected && this.token === token) {
      return this.socket;
    }

    // Disconnect existing
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
    }

    this.token = token;
    this.connectionState = 'connecting';

    this.socket = io(API_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 10000,
    });

    this.setupCoreListeners();
    this.reattachListeners();

    return this.socket;
  }

  private setupCoreListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      this.connectionState = 'connected';
      console.log('🔌 WebSocket connected:', this.socket?.id);
      // Mark online
      this.socket?.emit(WS_EVENTS.MARK_ONLINE, { status: 'online' });
    });

    this.socket.on('disconnect', (reason) => {
      this.connectionState = 'disconnected';
      console.log('❌ WebSocket disconnected:', reason);
    });

    this.socket.on('connect_error', (err) => {
      console.error('WebSocket error:', err.message);
      this.connectionState = 'disconnected';
    });

    this.socket.on(WS_EVENTS.ERROR, (data: { message: string }) => {
      console.error('Server error:', data.message);
    });
  }

  private reattachListeners() {
    if (!this.socket) return;
    this.listeners.forEach((handlers, event) => {
      handlers.forEach(handler => {
        this.socket!.on(event, handler as any);
      });
    });
  }

  disconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
    }
    this.token = null;
    this.connectionState = 'disconnected';
    this.listeners.clear();
  }

  on(event: string, handler: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(handler);
    this.socket?.on(event, handler as any);
  }

  off(event: string, handler: Function) {
    this.listeners.get(event)?.delete(handler);
    this.socket?.off(event, handler as any);
  }

  emit(event: string, data?: unknown) {
    if (!this.socket?.connected) {
      console.warn('WebSocket not connected, cannot emit:', event);
      return;
    }
    this.socket.emit(event, data);
  }

  get isConnected() { return this.connectionState === 'connected'; }
  get state() { return this.connectionState; }
  get id() { return this.socket?.id; }
}

export const socketManager = new SocketManager();
