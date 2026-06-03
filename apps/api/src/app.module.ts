// ══════════════════════════════════════════════════════════════
// EVERBRILLIANT — Application Module (Phase 12 Final)
// ══════════════════════════════════════════════════════════════
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

// Core
import { PrismaModule }        from './prisma/prisma.module';
import { CacheModule }         from './cache/cache.module';

// Auth
import { AuthModule }          from './modules/auth/auth.module';

// Business
import { TradingModule }       from './modules/trading/trading.module';
import { FinanceModule }       from './modules/finance/finance.module';
import { AutomationModule }    from './modules/automation/automation.module';
import { CrmModule }           from './modules/crm/crm.module';
import { ManufacturingModule } from './modules/manufacturing/manufacturing.module';
import { LogisticsModule }     from './modules/logistics/logistics.module';

// Infrastructure
import { NotificationsModule } from './modules/notifications/notifications.module';
import { HealthModule }        from './modules/health/health.module';
import { GatewayModule }       from './gateway/gateway.module';

// Dashboard
import { DashboardModule }     from './modules/dashboard/dashboard.module';

// Admin
import { AdminModule }         from './modules/admin/admin.module';

// SaaS
import { SaasModule }          from './modules/saas/saas.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    ThrottlerModule.forRoot([{
      ttl: 60_000,
      limit: process.env.NODE_ENV === 'production' ? 60 : 200,
    }]),
    PrismaModule,
    CacheModule,
    AuthModule,
    TradingModule,
    FinanceModule,
    AutomationModule,
    CrmModule,
    ManufacturingModule,
    LogisticsModule,
    NotificationsModule,
    HealthModule,
    GatewayModule,
    DashboardModule,
    AdminModule,
    SaasModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
