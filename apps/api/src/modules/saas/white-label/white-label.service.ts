// ══════════════════════════════════════════════════════════════
// EVERBRILLIANT SaaS — White Label Service
// ══════════════════════════════════════════════════════════════
import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CacheService } from '../../../cache/cache.service';
import { BillingService } from '../billing/billing.service';

export interface WhiteLabelDto {
  appName?: string;
  appNameFa?: string;
  logoUrl?: string;
  faviconUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  domain?: string;
  supportEmail?: string;
  supportPhone?: string;
  footerText?: string;
  customCss?: string;
}

@Injectable()
export class WhiteLabelService {
  constructor(
    private prisma: PrismaService,
    private cache: CacheService,
    private billing: BillingService,
  ) {}

  // ── Get config by company or domain ──────────────────────────
  async getConfig(companyId?: number, domain?: string) {
    const cacheKey = domain ? `wl:domain:${domain}` : `wl:company:${companyId}`;

    return this.cache.getOrSet(cacheKey, async () => {
      const where = domain ? { domain } : { companyId: companyId! };
      const config = await this.prisma.whiteLabelConfig.findUnique({ where });
      if (!config) return null;

      return {
        appName: config.appName,
        appNameFa: config.appNameFa || config.appName,
        logoUrl: config.logoUrl,
        faviconUrl: config.faviconUrl,
        primaryColor: config.primaryColor,
        secondaryColor: config.secondaryColor,
        domain: config.domain,
        supportEmail: config.supportEmail,
        supportPhone: config.supportPhone,
        footerText: config.footerText,
        customCss: config.customCss,
      };
    }, this.cache.TTL.LONG);
  }

  // ── Get CSS variables for white-label ─────────────────────────
  async getCssVariables(domain?: string): Promise<string> {
    const config = domain ? await this.getConfig(undefined, domain) : null;
    if (!config) {
      return ':root { --wl-primary: #3b82f6; --wl-secondary: #8b5cf6; }';
    }
    return `
      :root {
        --wl-primary: ${config.primaryColor};
        --wl-secondary: ${config.secondaryColor};
        --primary: ${this.hexToHsl(config.primaryColor)};
      }
      ${config.customCss || ''}
    `.trim();
  }

  // ── Update config (enterprise only) ──────────────────────────
  async updateConfig(companyId: number, dto: WhiteLabelDto) {
    await this.billing.requireFeature(companyId, 'whiteLabel');

    // Validate domain
    if (dto.domain && !this.isValidDomain(dto.domain)) {
      throw new Error('Invalid domain format');
    }

    // Validate colors
    if (dto.primaryColor && !this.isValidHex(dto.primaryColor)) {
      throw new Error('Invalid primary color hex');
    }

    const config = await this.prisma.whiteLabelConfig.upsert({
      where: { companyId },
      create: { companyId, ...(dto as any) },
      update: dto as any,
    });

    await this.cache.del(`wl:company:${companyId}`);
    if (dto.domain) await this.cache.del(`wl:domain:${dto.domain}`);

    return config;
  }

  async disableWhiteLabel(companyId: number) {
    await this.prisma.whiteLabelConfig.update({
      where: { companyId },
      data: { isActive: false },
    });
    await this.cache.del(`wl:company:${companyId}`);
  }

  private isValidDomain(domain: string): boolean {
    return /^[a-z0-9][a-z0-9\-\.]{0,253}[a-z0-9]$/.test(domain);
  }

  private isValidHex(hex: string): boolean {
    return /^#[0-9A-Fa-f]{6}$/.test(hex);
  }

  private hexToHsl(hex: string): string {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0;
    const l = (max + min) / 2;
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / d + 2) / 6; break;
        case b: h = ((r - g) / d + 4) / 6; break;
      }
    }
    return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
  }
}
