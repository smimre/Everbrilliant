import { Module } from '@nestjs/common';
import { PerformanceController } from './performance.controller';
import { GatewayModule } from '../../gateway/gateway.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule, GatewayModule],
  controllers: [PerformanceController],
})
export class AdminModule {}
