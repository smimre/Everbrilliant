import { Controller, Get, Post, Patch, Body, Param, Query, Req, UseGuards } from '@nestjs/common';
import { LogisticsService } from './logistics.service';
import { JwtAuthGuard } from '../auth/auth.guard';

@Controller('logistics')
@UseGuards(JwtAuthGuard)
export class LogisticsController {
  constructor(private logistics: LogisticsService) {}

  // ── Shipments ────────────────────────────────────────────────

  @Get('shipments')
  getShipments(@Req() r: any, @Query() q: any) {
    return this.logistics.getShipments(r.user.companyId, q);
  }

  @Post('shipments')
  createShipment(@Req() r: any, @Body() dto: any) {
    return this.logistics.createShipment(r.user.companyId, dto);
  }

  @Patch('shipments/:id')
  updateShipment(@Req() r: any, @Param('id') id: string, @Body() dto: any) {
    return this.logistics.updateShipment(r.user.companyId, id, dto);
  }

  @Post('shipments/:id/advance-stage')
  advanceStage(@Req() r: any, @Param('id') id: string, @Body() dto: any) {
    return this.logistics.advanceStage(r.user.companyId, id, dto);
  }

  @Post('shipments/:id/waybill')
  issueWaybill(@Req() r: any, @Param('id') id: string) {
    return this.logistics.issueWaybill(r.user.companyId, id);
  }

  // ── Rate Quotes ───────────────────────────────────────────────

  @Get('quotes')
  getRateQuotes(@Req() r: any) {
    return this.logistics.getRateQuotes(r.user.companyId);
  }

  @Post('quotes')
  createRateQuote(@Req() r: any, @Body() dto: any) {
    return this.logistics.createRateQuote(r.user.companyId, dto);
  }

  @Patch('quotes/:id/toggle')
  toggleRateQuote(@Req() r: any, @Param('id') id: string) {
    return this.logistics.toggleRateQuote(r.user.companyId, id);
  }

  // ── Reports ───────────────────────────────────────────────────

  @Get('reports')
  getReports(@Req() r: any) {
    return this.logistics.getReports(r.user.companyId);
  }
}
