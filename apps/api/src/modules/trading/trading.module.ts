import { Module } from '@nestjs/common';
import { TradingController } from './trading.controller';
import { TradingV2Controller } from './trading-v2.controller';
import { TradingService } from './trading.service';
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../../prisma/prisma.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [AuthModule, PrismaModule, NotificationsModule],
  controllers: [TradingController, TradingV2Controller],
  providers: [TradingService],
  exports: [TradingService],
})
export class TradingModule {}
