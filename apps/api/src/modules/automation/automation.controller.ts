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

  @Get('tasks')               getTasks(@Req() r: any, @Query() q: any)                 { return this.auto.getTasks(r.user.companyId, q); }
  @Post('tasks')              createTask(@Req() r: any, @Body() dto: any)               { return this.auto.createTask(r.user.companyId, r.user.id, dto); }
  @Patch('tasks/:id')         updateTask(@Req() r: any, @Param('id') id: string, @Body() dto: any) { return this.auto.updateTask(r.user.companyId, id, dto); }

  @Get('documents')           getDocuments(@Req() r: any, @Query() q: any)             { return this.auto.getDocuments(r.user.companyId, q); }
  @Post('documents')          createDocument(@Req() r: any, @Body() dto: any)           { return this.auto.createDocument(r.user.companyId, r.user.id, dto); }

  @Get('workflows')           getWorkflows(@Req() r: any)                               { return this.auto.getWorkflowTemplates(r.user.companyId); }
  @Post('workflows')          createWorkflow(@Req() r: any, @Body() dto: any)           { return this.auto.createWorkflowTemplate(r.user.companyId, dto); }
  @Post('workflows/:id/start') startInstance(@Req() r: any, @Param('id') id: string, @Body() dto: any) { return this.auto.startWorkflowInstance(r.user.companyId, id, dto); }
  @Patch('workflows/instances/:id/approve') approveStep(@Req() r: any, @Param('id') id: string) { return this.auto.approveWorkflowStep(r.user.companyId, id); }
}
