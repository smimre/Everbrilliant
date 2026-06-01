import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../../prisma/prisma.module';
import { CacheModule } from '../../cache/cache.module';

import { BillingController } from './billing/billing.controller';
import { BillingService } from './billing/billing.service';
import { PlansService } from './plans/plans.service';

import { UsageController } from './usage/usage.controller';
import { UsageService } from './usage/usage.service';
import { UsageLimitGuard } from './usage/usage.guard';

import { WhiteLabelController } from './white-label/white-label.controller';
import { WhiteLabelService } from './white-label/white-label.service';

@Module({
  imports: [AuthModule, PrismaModule, CacheModule],
  controllers: [BillingController, UsageController, WhiteLabelController],
  providers: [BillingService, PlansService, UsageService, UsageLimitGuard, WhiteLabelService],
  exports: [UsageService, PlansService],
})
export class SaasModule {}
