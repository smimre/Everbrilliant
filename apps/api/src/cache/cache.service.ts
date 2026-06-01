// ══════════════════════════════════════════════════════════════
// EVERBRILLIANT — Redis Cache Service
// ══════════════════════════════════════════════════════════════
import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, RedisClientType } from 'redis';

export interface CacheOptions {
  ttl?: number;        // seconds, default 60
  prefix?: string;
}

const DEFAULT_TTL = 60;

const CACHE_KEYS = {
  // Trading
  requests:      (companyId: number, page: number) => `req:${companyId}:${page}`,
  request:       (id: string)                      => `req:single:${id}`,
  tenders:       (page: number)                    => `tenders:${page}`,
  tender:        (id: string)                      => `tender:${id}`,
  contracts:     (companyId: number)               => `contracts:${companyId}`,
  // Finance
  invoices:      (companyId: number, page: number, status?: string) => `inv:${companyId}:${page}:${status||'all'}`,
  invoice:       (id: string)                      => `inv:single:${id}`,
  employees:     (companyId: number)               => `emp:${companyId}`,
  inventory:     (companyId: number, page: number) => `stock:${companyId}:${page}`,
  // Misc
  exchangeRates: ()                                => `rates:latest`,
  company:       (id: number)                      => `company:${id}`,
  userPerms:     (userId: number)                  => `perms:${userId}`,
} as const;

@Injectable()
export class CacheService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger('CacheService');
  private client: RedisClientType | null = null;
  private connected = false;

  readonly KEYS = CACHE_KEYS;

  // TTL presets (seconds)
  readonly TTL = {
    SHORT:   30,
    MEDIUM:  60,
    LONG:    300,
    HOUR:    3600,
    DAY:     86400,
  } as const;

  constructor(private config: ConfigService) {}

  async onModuleInit() {
    const url = this.config.get<string>('REDIS_URL');
    if (!url) {
      this.logger.warn('⚠️  REDIS_URL not set — caching disabled');
      return;
    }

    try {
      this.client = createClient({ url }) as RedisClientType;
      this.client.on('error', (err) => this.logger.error('Redis error:', err.message));
      this.client.on('reconnecting', () => this.logger.warn('Redis reconnecting…'));
      this.client.on('ready', () => { this.connected = true; this.logger.log('✅ Redis connected'); });

      await this.client.connect();
    } catch (err) {
      this.logger.error('Redis connection failed:', (err as Error).message);
      this.client = null;
    }
  }

  async onModuleDestroy() {
    if (this.client?.isOpen) await this.client.disconnect();
  }

  get isAvailable() { return this.connected && !!this.client?.isOpen; }

  // ── Core operations ───────────────────────────────────────────

  async get<T>(key: string): Promise<T | null> {
    if (!this.isAvailable) return null;
    try {
      const val = await this.client!.get(key);
      return val ? JSON.parse(val) : null;
    } catch { return null; }
  }

  async set(key: string, value: unknown, ttl = DEFAULT_TTL): Promise<void> {
    if (!this.isAvailable) return;
    try {
      await this.client!.setEx(key, ttl, JSON.stringify(value));
    } catch (err) {
      this.logger.warn(`Cache set failed for ${key}:`, (err as Error).message);
    }
  }

  async del(...keys: string[]): Promise<void> {
    if (!this.isAvailable || !keys.length) return;
    try { await this.client!.del(keys); } catch {}
  }

  async delPattern(pattern: string): Promise<void> {
    if (!this.isAvailable) return;
    try {
      const keys = await this.client!.keys(pattern);
      if (keys.length) await this.client!.del(keys);
    } catch {}
  }

  /** Get from cache or compute and cache */
  async getOrSet<T>(key: string, fn: () => Promise<T>, ttl = DEFAULT_TTL): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) return cached;

    const fresh = await fn();
    await this.set(key, fresh, ttl);
    return fresh;
  }

  // ── Invalidation helpers ──────────────────────────────────────

  async invalidateCompany(companyId: number) {
    await this.delPattern(`*:${companyId}:*`);
    await this.del(this.KEYS.company(companyId));
  }

  async invalidateRequests(companyId: number) {
    await this.delPattern(`req:${companyId}:*`);
  }

  async invalidateInvoices(companyId: number) {
    await this.delPattern(`inv:${companyId}:*`);
  }

  async invalidateInventory(companyId: number) {
    await this.delPattern(`stock:${companyId}:*`);
  }

  async invalidateTenders() {
    await this.delPattern('tenders:*');
    await this.delPattern('tender:*');
  }

  async invalidateUserPerms(userId: number) {
    await this.del(this.KEYS.userPerms(userId));
  }

  // ── Metrics ───────────────────────────────────────────────────
  async getStats() {
    if (!this.isAvailable) return { available: false };
    try {
      const info = await this.client!.info('stats');
      const memory = await this.client!.info('memory');
      const keyspace = await this.client!.info('keyspace');

      const parse = (s: string, k: string) => s.match(new RegExp(`${k}:(\\S+)`))?.[1] || '0';

      return {
        available: true,
        hits: Number(parse(info, 'keyspace_hits')),
        misses: Number(parse(info, 'keyspace_misses')),
        usedMemory: parse(memory, 'used_memory_human'),
        keyspace: keyspace.trim(),
      };
    } catch {
      return { available: false };
    }
  }
}
