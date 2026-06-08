import { Controller, Post, Patch, Body, Get, UseGuards, Req, HttpCode, HttpStatus } from '@nestjs/common';
import { Throttle, SkipThrottle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto, RefreshDto, ForgotPasswordDto, ResetPasswordDto, ChangePasswordDto, UpdateProfileDto, UpdateCompanyDto, SendOtpDto } from './auth.dto';
import { JwtAuthGuard, Public } from './auth.guard';

@Controller('auth')
@UseGuards(JwtAuthGuard)
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login') @Public() @HttpCode(HttpStatus.OK)
  @Throttle({ default: { ttl: 60_000, limit: 5 } })
  login(@Body() dto: LoginDto, @Req() req: any) {
    const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.ip;
    const ua = req.headers['user-agent'];
    return this.authService.login(dto, { ip, ua });
  }

  @Post('send-otp') @Public()
  @Throttle({ default: { ttl: 60_000, limit: 5 } })
  sendOtp(@Body() dto: SendOtpDto) { return this.authService.sendOtp(dto.phone); }

  @Post('register') @Public()
  @Throttle({ default: { ttl: 60_000, limit: 3 } })
  register(@Body() dto: RegisterDto, @Req() req: any) {
    const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.ip;
    const ua = req.headers['user-agent'];
    return this.authService.register(dto, { ip, ua });
  }

  @Post('refresh') @Public() @HttpCode(HttpStatus.OK)
  @Throttle({ default: { ttl: 60_000, limit: 20 } })
  refresh(@Body() dto: RefreshDto) { return this.authService.refresh(dto); }

  @Post('forgot-password') @Public() @HttpCode(HttpStatus.OK)
  @Throttle({ default: { ttl: 60_000, limit: 5 } })
  forgotPassword(@Body() dto: ForgotPasswordDto) { return this.authService.forgotPassword(dto); }

  @Post('reset-password') @Public() @HttpCode(HttpStatus.OK)
  @Throttle({ default: { ttl: 60_000, limit: 5 } })
  resetPassword(@Body() dto: ResetPasswordDto) { return this.authService.resetPassword(dto); }

  @Post('logout') @HttpCode(HttpStatus.OK)
  logout(@Req() req: any) {
    return this.authService.logout(req.token, req.user?.id, req.user?.companyId ?? undefined);
  }

  @Patch('change-password') @HttpCode(HttpStatus.OK)
  changePassword(@Req() req: any, @Body() dto: ChangePasswordDto) {
    return this.authService.changePassword(req.user.id, dto);
  }

  @Patch('me')
  updateProfile(@Req() req: any, @Body() dto: UpdateProfileDto) {
    return this.authService.updateProfile(req.user.id, dto);
  }

  @Get('me') @SkipThrottle()
  me(@Req() req: any) {
    const { password, twoFactorSecret, ...safe } = req.user;
    return safe;
  }

  @Get('company') @SkipThrottle()
  getCompany(@Req() req: any) {
    return this.authService.getCompany(req.user.companyId);
  }

  @Patch('company')
  updateCompany(@Req() req: any, @Body() dto: UpdateCompanyDto) {
    return this.authService.updateCompany(req.user.companyId, dto);
  }
}
