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
}
