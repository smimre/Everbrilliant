import { Controller, Get, Patch, Body, Req, Query, UseGuards, NotFoundException } from '@nestjs/common';
import { WhiteLabelService } from './white-label.service';
import { JwtAuthGuard, Public } from '../../auth/auth.guard';

@Controller('saas/white-label')
export class WhiteLabelController {
  constructor(private wl: WhiteLabelService) {}

  @Get('config')
  @UseGuards(JwtAuthGuard)
  async getConfig(@Query('domain') domain?: string, @Req() req?: any) {
    const config = await this.wl.getConfig(req?.user?.companyId, domain);
    if (config === null) throw new NotFoundException('No white-label config found');
    return config;
  }

  @Get('css')
  @Public()
  getCss(@Query('domain') domain?: string) {
    return this.wl.getCssVariables(domain);
  }

  @Patch('config')
  @UseGuards(JwtAuthGuard)
  updateConfig(@Req() req: any, @Body() dto: any) {
    return this.wl.updateConfig(req.user.companyId, dto);
  }
}
