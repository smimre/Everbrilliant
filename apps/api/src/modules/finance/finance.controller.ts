import { Controller, Get, Post, Patch, Body, Param, Query, Req, UseGuards } from '@nestjs/common';
import { FinanceService } from './finance.service';
import { JwtAuthGuard } from '../auth/auth.guard';

@Controller('finance')
@UseGuards(JwtAuthGuard)
export class FinanceController {
  constructor(private finance: FinanceService) {}

  // Invoices
  @Get('invoices')
  getInvoices(@Req() req: any, @Query() q: any) {
    return this.finance.getInvoices(req.user.companyId, q);
  }

  @Post('invoices')
  createInvoice(@Req() req: any, @Body() dto: any) {
    return this.finance.createInvoice(req.user.companyId, req.user.id, dto);
  }

  @Get('invoices/:id')
  getInvoice(@Req() req: any, @Param('id') id: string) {
    return this.finance.getInvoice(req.user.companyId, id);
  }

  @Patch('invoices/:id/pay')
  payInvoice(@Req() req: any, @Param('id') id: string, @Body() dto: any) {
    return this.finance.payInvoice(req.user.companyId, id, dto);
  }

  // Employees
  @Get('employees')
  getEmployees(@Req() req: any, @Query() q: any) {
    return this.finance.getEmployees(req.user.companyId, q);
  }

  @Post('employees')
  createEmployee(@Req() req: any, @Body() dto: any) {
    return this.finance.createEmployee(req.user.companyId, dto);
  }

  // Inventory
  @Get('inventory')
  getInventory(@Req() req: any, @Query() q: any) {
    return this.finance.getInventory(req.user.companyId, q);
  }

  @Post('inventory')
  addInventory(@Req() req: any, @Body() dto: any) {
    return this.finance.addInventory(req.user.companyId, dto);
  }

  @Post('inventory/:id/stock-in')
  stockIn(@Req() req: any, @Param('id') id: string, @Body() dto: { qty: number; ref?: string }) {
    return this.finance.stockMove(req.user.companyId, id, 'in', dto.qty, req.user.id, dto.ref);
  }

  @Post('inventory/:id/stock-out')
  stockOut(@Req() req: any, @Param('id') id: string, @Body() dto: { qty: number; ref?: string }) {
    return this.finance.stockMove(req.user.companyId, id, 'out', dto.qty, req.user.id, dto.ref);
  }

  // Accounts
  @Get('accounts')
  getAccounts(@Req() req: any, @Query() q: any) {
    return this.finance.getAccounts(req.user.companyId, q);
  }

  @Post('accounts')
  createAccount(@Req() req: any, @Body() dto: any) {
    return this.finance.createAccount(req.user.companyId, dto);
  }

  // Journal Entries
  @Get('journal-entries')
  getJournalEntries(@Req() req: any, @Query() q: any) {
    return this.finance.getJournalEntries(req.user.companyId, q);
  }

  @Post('journal-entries')
  createJournalEntry(@Req() req: any, @Body() dto: any) {
    return this.finance.createJournalEntry(req.user.companyId, req.user.id, dto);
  }

  // Reports
  @Get('reports/balance-sheet')
  getBalanceSheet(@Req() req: any) {
    return this.finance.getBalanceSheet(req.user.companyId);
  }

  @Get('reports/income-statement')
  getIncomeStatement(@Req() req: any, @Query() q: any) {
    return this.finance.getIncomeStatement(req.user.companyId, q.from, q.to);
  }

  @Get('reports/cash-flow')
  getCashFlow(@Req() req: any, @Query() q: any) {
    return this.finance.getCashFlow(req.user.companyId, q.from, q.to);
  }

  @Get('reports/trial-balance')
  getTrialBalance(@Req() req: any) {
    return this.finance.getTrialBalance(req.user.companyId);
  }
}
