import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}
  async getAll(userId: number, page=1, limit=20) {
    const skip=(page-1)*limit;
    const [data,total]=await Promise.all([
      this.prisma.notification.findMany({where:{userId},skip,take:limit,orderBy:{createdAt:'desc'}}),
      this.prisma.notification.count({where:{userId}}),
    ]);
    return {data,total,page,limit,totalPages:Math.ceil(total/limit)};
  }
  async getUnreadCount(userId: number) { return {count:await this.prisma.notification.count({where:{userId,isRead:false}})}; }
  async markRead(userId: number, id: string) { return this.prisma.notification.updateMany({where:{id,userId},data:{isRead:true,readAt:new Date()}}); }
  async markAllRead(userId: number) { return this.prisma.notification.updateMany({where:{userId,isRead:false},data:{isRead:true,readAt:new Date()}}); }
  async delete(userId: number, id: string) { await this.prisma.notification.deleteMany({where:{id,userId}}); return {success:true}; }
}
