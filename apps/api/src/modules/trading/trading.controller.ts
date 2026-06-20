import { Controller, Get, Post, Patch, Delete, Body, Param, Query, Req, UseGuards } from '@nestjs/common';
import { TradingService } from './trading.service';
import { JwtAuthGuard, Public } from '../auth/auth.guard';

@Controller('trading')
@UseGuards(JwtAuthGuard)
export class TradingController {
  constructor(private trading: TradingService) {}

  @Get('requests')       getRequests(@Req() r: any, @Query() q: any)                       { return this.trading.getRequests(r.user.companyId, q); }
  @Post('requests')      createRequest(@Req() r: any, @Body() dto: any)                    { return this.trading.createRequest(r.user.companyId, r.user.id, dto); }
  @Get('requests/:id')   getRequest(@Req() r: any, @Param('id') id: string)                { return this.trading.getRequest(r.user.companyId, id); }
  @Patch('requests/:id') updateRequest(@Req() r: any, @Param('id') id: string, @Body() d: any) { return this.trading.updateRequest(r.user.companyId, id, d); }
  @Patch('requests/:id/cancel')   cancelRequest(@Req() r: any, @Param('id') id: string)   { return this.trading.cancelRequest(r.user.companyId, id); }
  @Patch('requests/:id/paid')     markPaid(@Req() r: any, @Param('id') id: string)         { return this.trading.markPaid(r.user.companyId, id); }
  @Patch('requests/:id/issue')    issueHavaleh(@Req() r: any, @Param('id') id: string)     { return this.trading.issueHavaleh(r.user.companyId, id); }
  @Patch('requests/:id/complete') confirmReceipt(@Req() r: any, @Param('id') id: string)   { return this.trading.confirmReceipt(r.user.companyId, id); }

  @Get('quotes')              getAllQuotes(@Req() r: any, @Query() q: any)                  { return this.trading.getAllQuotes(r.user.companyId, q); }
  @Get('requests/:id/quotes') getQuotes(@Req() r: any, @Param('id') id: string)            { return this.trading.getQuotes(r.user.companyId, id); }
  @Post('quotes')             createQuote(@Req() r: any, @Body() dto: any)                 { return this.trading.createQuote(r.user.companyId, r.user.id, dto); }
  @Patch('quotes/:id/accept') acceptQuote(@Req() r: any, @Param('id') id: string)          { return this.trading.acceptQuote(r.user.companyId, id); }

  @Get('contracts')          getContracts(@Req() r: any, @Query() q: any)                  { return this.trading.getContracts(r.user.companyId, q); }
  @Post('contracts')         createContract(@Req() r: any, @Body() dto: any)               { return this.trading.createContractDirect(r.user.companyId, r.user.id, dto); }
  @Patch('contracts/:id/sign') signContract(@Req() r: any, @Param('id') id: string)        { return this.trading.signContract(r.user.companyId, id); }

  @Get('tenders')            getTenders(@Req() r: any, @Query() q: any)                    { return this.trading.getTenders(q, q.mine === 'true' ? r.user.companyId : undefined); }
  @Post('tenders')           createTender(@Req() r: any, @Body() dto: any)                 { return this.trading.createTender(r.user.companyId, r.user.id, dto); }
  @Post('tenders/:id/bids')   placeBid(@Req() r: any, @Param('id') id: string, @Body() d: any)    { return this.trading.placeBid(r.user.companyId, r.user.id, id, d); }
  @Get('tenders/:id/bids')    getTenderBids(@Req() r: any, @Param('id') id: string)               { return this.trading.getTenderBids(r.user.companyId, id); }
  @Patch('tenders/:id/close') closeTender(@Req() r: any, @Param('id') id: string)                 { return this.trading.closeTender(r.user.companyId, id); }
  @Patch('tenders/:id/award') awardTender(@Req() r: any, @Param('id') id: string)                 { return this.trading.awardTender(r.user.companyId, id); }
  @Post('tenders/:id/invite') createInvite(@Req() r: any, @Param('id') id: string)               { return this.trading.createTenderInvite(r.user.companyId, id); }

  @Get('invites/:token') @Public() getInvite(@Param('token') token: string)                      { return this.trading.getTenderInvite(token); }

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

  // ── Follow-ups ─────────────────────────────────────────────
  @Get('followups')
  getAllFollowUps(@Req() r: any, @Query() q: any) {
    return this.trading.getAllFollowUps(r.user.companyId, q);
  }

  @Get('requests/:id/followups')
  getFollowUps(@Req() r: any, @Param('id') id: string) {
    return this.trading.getFollowUps(r.user.companyId, id);
  }

  @Post('requests/:id/followups')
  createFollowUp(@Req() r: any, @Param('id') id: string, @Body() dto: any) {
    return this.trading.createFollowUp(r.user.companyId, r.user.id, id, dto);
  }

  @Patch('followups/:id/done')
  markFollowUpDone(@Req() r: any, @Param('id') id: string) {
    return this.trading.markFollowUpDone(r.user.companyId, id);
  }

  // ── CRM stats ──────────────────────────────────────────────
  @Get('crm/stats')
  getCRMStats(@Req() r: any) {
    return this.trading.getCRMStats(r.user.companyId);
  }
}
