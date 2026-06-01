import { Injectable, UnauthorizedException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { LoginDto, RegisterDto } from './auth.dto';

@Injectable()
export class AuthService {
  private loginAttempts = new Map<string, { count: number; lockedUntil: number }>();

  constructor(private prisma: PrismaService, private jwt: JwtService) {}

  async login(dto: LoginDto) {
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

    return {
      accessToken, refreshToken,
      user: { id: user.id, name: user.name, phone: user.phone, email: user.email, role: user.role.name, companyId: user.companyId, company: user.company, permissions },
    };
  }

  async register(dto: RegisterDto) {
    const exists = await this.prisma.user.findUnique({ where: { phone: dto.phone } });
    if (exists) throw new BadRequestException('Phone already registered');

    const role = await this.prisma.role.findFirst({ where: { name: 'company_admin' } });
    if (!role) throw new BadRequestException('System roles not initialized');

    const hashed = await bcrypt.hash(dto.password, 12);
    const company = await this.prisma.company.create({ data: { name: dto.companyName || dto.name } });
    const user = await this.prisma.user.create({
      data: { name: dto.name, phone: dto.phone, password: hashed, companyId: company.id, roleId: role.id, isCompanyAdmin: true },
      include: { role: true },
    });

    const accessToken = this.jwt.sign({ sub: user.id, phone: user.phone, companyId: company.id, role: user.role.name, permissions: [] }, { expiresIn: '8h' });
    await this.prisma.session.create({
      data: { userId: user.id, token: accessToken, expiresAt: new Date(Date.now() + 8 * 3600 * 1000) },
    });
    return { accessToken, user: { id: user.id, name: user.name, phone: user.phone } };
  }

  async logout(token: string) {
    await this.prisma.session.deleteMany({ where: { token } }).catch(() => {});
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
