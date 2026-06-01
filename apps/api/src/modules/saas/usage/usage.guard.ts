// ══════════════════════════════════════════════════════════════
// Usage Guard — checks limits before resource creation
// Usage: @UseGuards(UsageLimitGuard) + @CheckLimit('requests')
// ══════════════════════════════════════════════════════════════
import {
  CanActivate, ExecutionContext, Injectable,
  SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UsageService, MetricKey } from './usage.service';

export const CHECK_LIMIT_KEY = 'check_limit';
export const CheckLimit = (metric: MetricKey) => SetMetadata(CHECK_LIMIT_KEY, metric);
export const RequireFeature = (feature: string) => SetMetadata('require_feature', feature);

@Injectable()
export class UsageLimitGuard implements CanActivate {
  constructor(private usage: UsageService, private reflector: Reflector) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest();
    if (!req.user?.companyId) return true;

    const metric = this.reflector.get<MetricKey>(CHECK_LIMIT_KEY, ctx.getHandler());
    if (metric) {
      await this.usage.checkLimit(req.user.companyId, metric);
    }

    const feature = this.reflector.get<string>('require_feature', ctx.getHandler());
    if (feature) {
      await this.usage.requireFeature(req.user.companyId, feature);
    }

    return true;
  }
}
