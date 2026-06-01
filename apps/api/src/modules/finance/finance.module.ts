import { Module } from '@nestjs/common';
import { FinanceController } from './finance.controller';
import { FinanceV2Controller } from './finance-v2.controller';
import { FinanceService } from './finance.service';
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [AuthModule, PrismaModule],
  controllers: [FinanceController, FinanceV2Controller],
  providers: [FinanceService],
  exports: [FinanceService],
})
export class FinanceModule {}
