import { Controller, Get, Post, Patch, Body, Param, Query, Req, UseGuards } from '@nestjs/common';
import { AutomationService } from './automation.service';
import { JwtAuthGuard } from '../auth/auth.guard';

@Controller('automation')
@UseGuards(JwtAuthGuard)
export class AutomationController {
  constructor(private auto: AutomationService) {}

  @Get('letters')             getLetters(@Req() r: any, @Query() q: any)              { return this.auto.getLetters(r.user.companyId, q); }
  @Post('letters')            createLetter(@Req() r: any, @Body() dto: any)            { return this.auto.createLetter(r.user.companyId, r.user.id, dto); }
  @Patch('letters/:id/archive') archiveLetter(@Req() r: any, @Param('id') id: string) { return this.auto.archiveLetter(r.user.companyId, id); }

  @Get('requests')            getRequests(@Req() r: any, @Query() q: any)              { return this.auto.getWorkflowRequests(r.user.companyId, q); }
  @Post('requests')           createRequest(@Req() r: any, @Body() dto: any)           { return this.auto.createWorkflowRequest(r.user.companyId, r.user.id, dto); }
  @Patch('requests/:id/approve') approve(@Req() r: any, @Param('id') id: string, @Body() b: any) { return this.auto.approveRequest(r.user.companyId, r.user.id, id, b.comment); }
  @Patch('requests/:id/reject')  reject(@Req() r: any, @Param('id') id: string, @Body() b: any)  { return this.auto.rejectRequest(r.user.companyId, r.user.id, id, b.comment); }

  @Get('meetings')            getMeetings(@Req() r: any, @Query() q: any)              { return this.auto.getMeetings(r.user.companyId, q); }
  @Post('meetings')           createMeeting(@Req() r: any, @Body() dto: any)           { return this.auto.createMeeting(r.user.companyId, r.user.id, dto); }
  @Patch('meetings/:id/minutes') addMinutes(@Req() r: any, @Param('id') id: string, @Body() b: any) { return this.auto.addMinutes(r.user.companyId, id, b.minutes); }
}
