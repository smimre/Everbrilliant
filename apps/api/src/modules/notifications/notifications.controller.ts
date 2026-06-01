import { Controller,Get,Patch,Delete,Param,Query,Req,UseGuards } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/auth.guard';
@Controller('notifications') @UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private svc: NotificationsService) {}
  @Get() getAll(@Req() r:any,@Query('page') p:number,@Query('limit') l:number){return this.svc.getAll(r.user.id,+p||1,+l||20);}
  @Get('unread-count') count(@Req() r:any){return this.svc.getUnreadCount(r.user.id);}
  @Patch(':id/read') markRead(@Req() r:any,@Param('id') id:string){return this.svc.markRead(r.user.id,id);}
  @Patch('read-all') markAllRead(@Req() r:any){return this.svc.markAllRead(r.user.id);}
  @Delete(':id') delete(@Req() r:any,@Param('id') id:string){return this.svc.delete(r.user.id,id);}
}
