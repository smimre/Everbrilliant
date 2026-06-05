import { Controller, Get, Post, Patch, Delete, Body, Param, Query, Req, UseGuards } from '@nestjs/common';
import { CrmService } from './crm.service';
import { JwtAuthGuard } from '../auth/auth.guard';

@Controller('crm')
@UseGuards(JwtAuthGuard)
export class CrmController {
  constructor(private crm: CrmService) {}

  @Get('connections')
  getConnections(@Req() r: any, @Query() q: any) {
    return this.crm.getConnections(r.user.companyId, q);
  }

  @Post('connections')
  addConnection(@Req() r: any, @Body() dto: { inviteCode: string }) {
    return this.crm.addConnection(r.user.companyId, dto.inviteCode);
  }

  @Get('search')
  searchCompanies(@Query('q') q: string) {
    return this.crm.searchCompanies(q || '');
  }

  // Deals
  @Get('deals')
  getDeals(@Req() r: any, @Query() q: any) {
    return this.crm.getDeals(r.user.companyId, q);
  }

  @Get('stats')
  getStats(@Req() r: any) {
    return this.crm.getDealStats(r.user.companyId);
  }

  @Get('deals/stats')
  getDealStats(@Req() r: any) {
    return this.crm.getDealStats(r.user.companyId);
  }

  @Post('deals')
  createDeal(@Req() r: any, @Body() dto: any) {
    return this.crm.createDeal(r.user.companyId, r.user.id, dto);
  }

  @Patch('deals/:id')
  updateDeal(@Req() r: any, @Param('id') id: string, @Body() dto: any) {
    return this.crm.updateDealStage(r.user.companyId, id, dto);
  }

  @Delete('deals/:id')
  deleteDeal(@Req() r: any, @Param('id') id: string) {
    return this.crm.deleteDeal(r.user.companyId, id);
  }
}
