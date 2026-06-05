import { Injectable, UnauthorizedException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { LoginDto, RegisterDto, RefreshDto, ForgotPasswordDto, ResetPasswordDto, ChangePasswordDto, UpdateProfileDto } from './auth.dto';

@Injectable()
export class AuthService {
  private loginAttempts = new Map<string, { count: number; lockedUntil: number }>();

  constructor(private prisma: PrismaService, private jwt: JwtService) {}

  private async audit(params: {
    userId?: number;
    companyId?: number;
    action: 'LOGIN' | 'LOGOUT' | 'CREATE' | 'UPDATE';
    module: string;
    description: string;
    ipAddress?: string;
    userAgent?: string;
  }) {
    await this.prisma.auditLog.create({ data: { ...params } }).catch(() => {});
  }

  async login(dto: LoginDto, meta?: { ip?: string; ua?: string }) {
    const key = dto.phone.toLowerCase();
    const attempt = this.loginAttempts.get(key) || { count: 0, lockedUntil: 0 };

    if (attempt.lockedUntil > Date.now()) {
      const rem = Math.ceil((attempt.lockedUntil - Date.now()) / 60000);
      throw new ForbiddenException(`Account locked. Retry in ${rem} minutes.`);
    }

    const user = await this.prisma.user.findUnique({
      where: { phone: dto.phone },
      include: {
        company: true,
        role: { include: { permissions: { include: { permission: true } } } },
      },
    });

    const valid = user && await bcrypt.compare(dto.password, user.password);

    if (!valid) {
      attempt.count++;
      if (attempt.count >= 5) {
        attempt.lockedUntil = Date.now() + 15 * 60 * 1000;
        attempt.count = 0;
      }
      this.loginAttempts.set(key, attempt);
      await this.audit({
        userId: user?.id,
        companyId: user?.companyId ?? undefined,
        action: 'LOGIN',
        module: 'auth',
        description: `Failed login attempt for phone ${dto.phone}`,
        ipAddress: meta?.ip,
        userAgent: meta?.ua,
      });
      throw new UnauthorizedException('Invalid credentials');
    }

    this.loginAttempts.delete(key);

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const permissions = user.role.permissions.map((rp: any) => rp.permission.key);
    const payload = { sub: user.id, phone: user.phone, companyId: user.companyId, role: user.role.name, permissions };
    const accessToken = this.jwt.sign(payload, { expiresIn: '8h' });
    const refreshToken = this.jwt.sign({ sub: user.id }, { expiresIn: '7d' });

    await this.prisma.session.create({
      data: { userId: user.id, token: accessToken, expiresAt: new Date(Date.now() + 8 * 3600 * 1000) },
    });

    await this.audit({
      userId: user.id,
      companyId: user.companyId ?? undefined,
      action: 'LOGIN',
      module: 'auth',
      description: `User ${user.name} logged in`,
      ipAddress: meta?.ip,
      userAgent: meta?.ua,
    });

    return {
      accessToken, refreshToken,
      user: { id: user.id, name: user.name, phone: user.phone, email: user.email, role: user.role.name, companyId: user.companyId, company: user.company, permissions },
    };
  }

  async register(dto: RegisterDto, meta?: { ip?: string; ua?: string }) {
    const exists = await this.prisma.user.findUnique({ where: { phone: dto.phone } });
    if (exists) throw new BadRequestException('Phone already registered');

    const role = await this.prisma.role.findFirst({ where: { name: 'company_admin' } });
    if (!role) throw new BadRequestException('System roles not initialized');

    const hashed = await bcrypt.hash(dto.password, 12);
    const company = await this.prisma.company.create({ data: { name: dto.companyName || dto.name, country: dto.country } });
    const user = await this.prisma.user.create({
      data: { name: dto.name, phone: dto.phone, email: dto.email ?? null, password: hashed, companyId: company.id, roleId: role.id, isCompanyAdmin: true },
      include: { role: { include: { permissions: { include: { permission: true } } } } },
    });

    const permissions = user.role.permissions.map((rp: any) => rp.permission.key);
    const accessToken = this.jwt.sign({ sub: user.id, phone: user.phone, companyId: company.id, role: user.role.name, permissions }, { expiresIn: '8h' });
    await this.prisma.session.create({
      data: { userId: user.id, token: accessToken, expiresAt: new Date(Date.now() + 8 * 3600 * 1000) },
    });

    await this.audit({
      userId: user.id,
      companyId: company.id,
      action: 'CREATE',
      module: 'auth',
      description: `New account registered: ${user.name} (${user.phone})`,
      ipAddress: meta?.ip,
      userAgent: meta?.ua,
    });

    return { accessToken, user: { id: user.id, name: user.name, phone: user.phone } };
  }

  async refresh(dto: RefreshDto) {
    let payload: any;
    try {
      payload = this.jwt.verify(dto.refreshToken);
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      include: { role: { include: { permissions: { include: { permission: true } } } } },
    });
    if (!user || !user.isActive) throw new UnauthorizedException('User not found or inactive');

    const permissions = user.role.permissions.map((rp: any) => rp.permission.key);
    const accessToken = this.jwt.sign(
      { sub: user.id, phone: user.phone, companyId: user.companyId, role: user.role.name, permissions },
      { expiresIn: '8h' },
    );
    const refreshToken = this.jwt.sign({ sub: user.id }, { expiresIn: '7d' });

    await this.prisma.session.deleteMany({ where: { userId: user.id } });
    await this.prisma.session.create({
      data: { userId: user.id, token: accessToken, expiresAt: new Date(Date.now() + 8 * 3600 * 1000) },
    });

    return { accessToken, refreshToken };
  }

  async changePassword(userId: number, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('User not found');

    const valid = await bcrypt.compare(dto.currentPassword, user.password);
    if (!valid) throw new BadRequestException('Current password is incorrect');

    const hashed = await bcrypt.hash(dto.newPassword, 12);
    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashed, passwordChangedAt: new Date() },
    });

    await this.audit({
      userId,
      companyId: user.companyId ?? undefined,
      action: 'UPDATE',
      module: 'auth',
      description: `User ${user.name} changed their password`,
    });

    return { message: 'Password changed successfully' };
  }

  async updateProfile(userId: number, dto: UpdateProfileDto) {
    if (dto.email) {
      const existing = await this.prisma.user.findFirst({
        where: { email: dto.email, NOT: { id: userId } },
      });
      if (existing) throw new BadRequestException('Email already in use');
    }

    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(dto.name  ? { name: dto.name }   : {}),
        ...(dto.email !== undefined ? { email: dto.email } : {}),
      },
    });

    const { password, twoFactorSecret, resetToken, resetTokenExpiry, ...safe } = user as any;
    return safe;
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.prisma.user.findFirst({
      where: { OR: [{ phone: dto.identifier }, { email: dto.identifier }] },
    });

    // Always respond the same way to prevent account enumeration
    if (!user) return { message: 'If an account exists, a reset code has been sent.' };

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 15 * 60 * 1000); // 15 min

    await this.prisma.user.update({
      where: { id: user.id },
      data: { resetToken: code, resetTokenExpiry: expiry },
    });

    // TODO: replace with SMS/email delivery when provider is configured
    console.log(`[PASSWORD RESET] Code for ${dto.identifier}: ${code}`);

    return { message: 'If an account exists, a reset code has been sent.' };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const user = await this.prisma.user.findFirst({
      where: {
        resetToken: dto.token,
        resetTokenExpiry: { gt: new Date() },
      },
    });

    if (!user) throw new BadRequestException('Invalid or expired reset code');

    const hashed = await bcrypt.hash(dto.password, 12);
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashed,
        resetToken: null,
        resetTokenExpiry: null,
        passwordChangedAt: new Date(),
      },
    });

    await this.prisma.session.deleteMany({ where: { userId: user.id } });

    return { message: 'Password reset successfully' };
  }

  async logout(token: string, userId?: number, companyId?: number) {
    await this.prisma.session.deleteMany({ where: { token } }).catch(() => {});
    if (userId) {
      await this.audit({
        userId,
        companyId,
        action: 'LOGOUT',
        module: 'auth',
        description: `User logged out`,
      });
    }
    return { success: true };
  }

  async validateToken(token: string) {
    const session = await this.prisma.session.findUnique({
      where: { token },
      include: { user: { include: { role: { include: { permissions: { include: { permission: true } } } }, company: true } } },
    });
    if (!session || session.expiresAt < new Date()) return null;
    return session.user;
  }
}
