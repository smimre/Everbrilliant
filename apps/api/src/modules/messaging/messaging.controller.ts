import { Controller, Get, Post, Patch, Param, Body, Req, Query, UseGuards } from '@nestjs/common';
import { MessagingService } from './messaging.service';
import { JwtAuthGuard } from '../auth/auth.guard';

@Controller('messages')
@UseGuards(JwtAuthGuard)
export class MessagingController {
  constructor(private msg: MessagingService) {}

  @Get('inbox')           getInbox(@Req() r: any, @Query() q: any)                         { return this.msg.getInbox(r.user.companyId, q); }
  @Get('sent')            getSent(@Req() r: any, @Query() q: any)                           { return this.msg.getSent(r.user.companyId, q); }
  @Get('unread-count')    getUnreadCount(@Req() r: any)                                     { return this.msg.getUnreadCount(r.user.companyId); }
  @Post()                 send(@Req() r: any, @Body() dto: any)                             { return this.msg.send(r.user.companyId, r.user.id, dto); }
  @Patch(':id/read')      markRead(@Req() r: any, @Param('id') id: string)                  { return this.msg.markRead(r.user.companyId, id); }
  @Patch('read-all')      markAllRead(@Req() r: any)                                        { return this.msg.markAllRead(r.user.companyId); }
  @Patch(':id/star')      toggleStar(@Req() r: any, @Param('id') id: string)               { return this.msg.toggleStar(r.user.companyId, id); }
  @Post(':id/reply')      reply(@Req() r: any, @Param('id') id: string, @Body() dto: any)  { return this.msg.reply(r.user.companyId, r.user.id, id, dto); }
}
