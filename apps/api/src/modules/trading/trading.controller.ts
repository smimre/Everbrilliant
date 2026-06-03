import { Controller, Get, Post, Patch, Delete, Body, Param, Query, Req, UseGuards } from '@nestjs/common';
import { TradingService } from './trading.service';
import { JwtAuthGuard } from '../auth/auth.guard';

@Controller('trading')
@UseGuards(JwtAuthGuard)
export class TradingController {
  constructor(private trading: TradingService) {}

  @Get('requests')       getRequests(@Req() r: any, @Query() q: any)                       { return this.trading.getRequests(r.user.companyId, q); }
  @Post('requests')      createRequest(@Req() r: any, @Body() dto: any)                    { return this.trading.createRequest(r.user.companyId, r.user.id, dto); }
  @Get('requests/:id')   getRequest(@Req() r: any, @Param('id') id: string)                { return this.trading.getRequest(r.user.companyId, id); }
  @Patch('requests/:id') updateRequest(@Req() r: any, @Param('id') id: string, @Body() d: any) { return this.trading.updateRequest(r.user.companyId, id, d); }
  @Patch('requests/:id/cancel') cancelRequest(@Req() r: any, @Param('id') id: string)     { return this.trading.cancelRequest(r.user.companyId, id); }

  @Get('requests/:id/quotes') getQuotes(@Req() r: any, @Param('id') id: string)            { return this.trading.getQuotes(r.user.companyId, id); }
  @Post('quotes')             createQuote(@Req() r: any, @Body() dto: any)                 { return this.trading.createQuote(r.user.companyId, r.user.id, dto); }
  @Patch('quotes/:id/accept') acceptQuote(@Req() r: any, @Param('id') id: string)          { return this.trading.acceptQuote(r.user.companyId, id); }

  @Get('contracts')          getContracts(@Req() r: any, @Query() q: any)                  { return this.trading.getContracts(r.user.companyId, q); }
  @Patch('contracts/:id/sign') signContract(@Req() r: any, @Param('id') id: string)        { return this.trading.signContract(r.user.companyId, id); }

  @Get('tenders')            getTenders(@Query() q: any)                                    { return this.trading.getTenders(q); }
  @Post('tenders')           createTender(@Req() r: any, @Body() dto: any)                 { return this.trading.createTender(r.user.companyId, r.user.id, dto); }
  @Post('tenders/:id/bids')  placeBid(@Req() r: any, @Param('id') id: string, @Body() d: any) { return this.trading.placeBid(r.user.companyId, r.user.id, id, d); }

  @Get('connections')        getConnections(@Req() r: any, @Query() q: any)                { return this.trading.getConnections(r.user.companyId, q); }

  // Blacklist
  @Get('blacklist')
  getBlacklist(@Req() r: any, @Query() q: any) {
    return this.trading.getBlacklist(r.user.companyId, q);
  }

  @Post('blacklist')
  addToBlacklist(@Req() r: any, @Body() dto: any) {
    return this.trading.addToBlacklist(r.user.companyId, r.user.id, dto);
  }

  @Patch('blacklist/:id/appeal')
  appealBlacklist(@Req() r: any, @Param('id') id: string) {
    return this.trading.appealBlacklist(r.user.companyId, Number(id));
  }

  @Delete('blacklist/:id')
  removeFromBlacklist(@Req() r: any, @Param('id') id: string) {
    return this.trading.removeFromBlacklist(r.user.companyId, Number(id));
  }
}
