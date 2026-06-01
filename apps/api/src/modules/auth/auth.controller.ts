import { Controller, Post, Body, Get, UseGuards, Req, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from './auth.dto';
import { JwtAuthGuard, Public } from './auth.guard';

@Controller('auth')
@UseGuards(JwtAuthGuard)
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login') @Public() @HttpCode(HttpStatus.OK)
  login(@Body() dto: LoginDto) { return this.authService.login(dto); }

  @Post('register') @Public()
  register(@Body() dto: RegisterDto) { return this.authService.register(dto); }

  @Post('logout') @HttpCode(HttpStatus.OK)
  logout(@Req() req: any) { return this.authService.logout(req.token); }

  @Get('me')
  me(@Req() req: any) { return req.user; }
}
