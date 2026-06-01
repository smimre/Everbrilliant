import { Module } from '@nestjs/common';
import { EventsGateway } from './events.gateway';
import { RealtimeService } from './realtime.service';
import { AuthModule } from '../modules/auth/auth.module';

@Module({
  imports: [AuthModule],
  providers: [EventsGateway, RealtimeService],
  exports: [EventsGateway, RealtimeService],
})
export class GatewayModule {}
