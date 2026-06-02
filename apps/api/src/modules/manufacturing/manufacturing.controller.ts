import { Controller, Get, Post, Patch, Body, Param, Query, Req, UseGuards } from '@nestjs/common';
import { ManufacturingService } from './manufacturing.service';
import { JwtAuthGuard } from '../auth/auth.guard';

@Controller('manufacturing')
@UseGuards(JwtAuthGuard)
export class ManufacturingController {
  constructor(private manufacturing: ManufacturingService) {}

  // ── Work Orders ───────────────────────────────────────────────
  @Get('work-orders')
  getWorkOrders(@Req() r: any, @Query() q: any) {
    return this.manufacturing.getWorkOrders(r.user.companyId, q);
  }

  @Post('work-orders')
  createWorkOrder(@Req() r: any, @Body() dto: any) {
    return this.manufacturing.createWorkOrder(r.user.companyId, r.user.id, dto);
  }

  @Get('work-orders/:id')
  getWorkOrder(@Req() r: any, @Param('id') id: string) {
    return this.manufacturing.getWorkOrder(r.user.companyId, id);
  }

  @Patch('work-orders/:id')
  updateWorkOrder(@Req() r: any, @Param('id') id: string, @Body() dto: any) {
    return this.manufacturing.updateWorkOrder(r.user.companyId, id, dto);
  }

  @Get('work-orders/:id/wip')
  getWorkOrderWIP(@Req() r: any, @Param('id') id: string) {
    return this.manufacturing.getWIP(r.user.companyId);
  }

  @Post('work-orders/:id/wip')
  addWIPEntry(@Req() r: any, @Param('id') id: string, @Body() dto: any) {
    return this.manufacturing.addWIPEntry(r.user.companyId, r.user.id, id, dto);
  }

  @Post('work-orders/:id/qc')
  createQCInspection(@Req() r: any, @Param('id') id: string, @Body() dto: any) {
    return this.manufacturing.createQCInspection(r.user.companyId, r.user.id, id, dto);
  }

  // ── BOMs ──────────────────────────────────────────────────────
  @Get('boms')
  getBOMs(@Req() r: any, @Query() q: any) {
    return this.manufacturing.getBOMs(r.user.companyId, q);
  }

  @Post('boms')
  createBOM(@Req() r: any, @Body() dto: any) {
    return this.manufacturing.createBOM(r.user.companyId, r.user.id, dto);
  }

  @Get('boms/:id')
  getBOM(@Req() r: any, @Param('id') id: string) {
    return this.manufacturing.getBOM(r.user.companyId, id);
  }

  // ── Raw Materials ─────────────────────────────────────────────
  @Get('materials')
  getMaterials(@Req() r: any, @Query() q: any) {
    return this.manufacturing.getMaterials(r.user.companyId, q);
  }

  @Post('materials')
  createMaterial(@Req() r: any, @Body() dto: any) {
    return this.manufacturing.createMaterial(r.user.companyId, dto);
  }

  @Patch('materials/:id')
  updateMaterial(@Req() r: any, @Param('id') id: string, @Body() dto: any) {
    return this.manufacturing.updateMaterial(r.user.companyId, id, dto);
  }

  @Post('materials/po')
  createPO(@Req() r: any, @Body() dto: any) {
    return this.manufacturing.createPO(r.user.companyId, r.user.id, dto);
  }

  // ── WIP ───────────────────────────────────────────────────────
  @Get('wip')
  getWIP(@Req() r: any) {
    return this.manufacturing.getWIP(r.user.companyId);
  }

  // ── Quality Checks ────────────────────────────────────────────
  @Get('quality-checks')
  getQualityChecks(@Req() r: any, @Query() q: any) {
    return this.manufacturing.getQualityChecks(r.user.companyId, q);
  }

  // ── Reports ───────────────────────────────────────────────────
  @Get('reports/summary')
  getReportsSummary(@Req() r: any) {
    return this.manufacturing.getReportsSummary(r.user.companyId);
  }
}
