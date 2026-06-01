import { CanActivate, ExecutionContext, Injectable, UnauthorizedException, SetMetadata } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthService } from './auth.service';

export const IS_PUBLIC = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC, true);
export const RequirePermissions = (...perms: string[]) => SetMetadata('permissions', perms);

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private authService: AuthService, private reflector: Reflector) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC, [ctx.getHandler(), ctx.getClass()]);
    if (isPublic) return true;

    const req = ctx.switchToHttp().getRequest();
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) throw new UnauthorizedException('No token');

    const user = await this.authService.validateToken(token);
    if (!user) throw new UnauthorizedException('Invalid token');

    req.user = user;
    req.token = token;

    const perms = this.reflector.getAllAndOverride<string[]>('permissions', [ctx.getHandler(), ctx.getClass()]);
    if (!perms?.length) return true;

    const userPerms = (user as any).role.permissions.map((rp: any) => rp.permission.key);
    const role = (user as any).role.name;
    if (['company_admin', 'sys_admin'].includes(role)) return true;

    return perms.some((p) => userPerms.includes(p));
  }
}
