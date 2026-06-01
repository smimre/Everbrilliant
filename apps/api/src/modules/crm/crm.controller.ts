import { Controller, Get, Post, Body, Query, Req, UseGuards } from '@nestjs/common';
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
}
