import { Controller, Post, Body, Get, UseGuards, Req, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto, RefreshDto, ForgotPasswordDto, ResetPasswordDto } from './auth.dto';
import { JwtAuthGuard, Public } from './auth.guard';

@Controller('auth')
@UseGuards(JwtAuthGuard)
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login') @Public() @HttpCode(HttpStatus.OK)
  login(@Body() dto: LoginDto) { return this.authService.login(dto); }

  @Post('register') @Public()
  register(@Body() dto: RegisterDto) { return this.authService.register(dto); }

  @Post('refresh') @Public() @HttpCode(HttpStatus.OK)
  refresh(@Body() dto: RefreshDto) { return this.authService.refresh(dto); }

  @Post('forgot-password') @Public() @HttpCode(HttpStatus.OK)
  forgotPassword(@Body() dto: ForgotPasswordDto) { return this.authService.forgotPassword(dto); }

  @Post('reset-password') @Public() @HttpCode(HttpStatus.OK)
  resetPassword(@Body() dto: ResetPasswordDto) { return this.authService.resetPassword(dto); }

  @Post('logout') @HttpCode(HttpStatus.OK)
  logout(@Req() req: any) { return this.authService.logout(req.token); }

  @Get('me')
  me(@Req() req: any) {
    const { password, twoFactorSecret, ...safe } = req.user;
    return safe;
  }
}
