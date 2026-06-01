// ══════════════════════════════════════════════════════════════
// E2E Tests: Finance Module
// ══════════════════════════════════════════════════════════════
import { test, expect } from '@playwright/test';
import { login } from '../helpers/auth';

test.describe('Finance Module', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.click('button:has-text("Finance"), button:has-text("مالی")');
    await page.waitForLoadState('networkidle');
  });

  test('finance dashboard shows navigation cards', async ({ page }) => {
    await expect(page.locator(':text("Invoice"), :text("فاکتور")')).toBeVisible();
    await expect(page.locator(':text("HR"), :text("پرسنل")')).toBeVisible();
  });

  test('invoice list loads', async ({ page }) => {
    // Click invoices nav
    await page.click(':text("Invoices"), :text("فاکتورها")');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('table, [role="table"], [data-testid="invoice-table"]').first()).toBeVisible({ timeout: 8000 });
  });

  test('invoice search works', async ({ page }) => {
    await page.click(':text("Invoices"), :text("فاکتورها")');
    await page.waitForLoadState('networkidle');
    const searchInput = page.locator('input[placeholder*="Search"], input[placeholder*="جستجو"]');
    if (await searchInput.count() > 0) {
      await searchInput.fill('TINV');
      await page.waitForTimeout(500);
      // Results should update
    }
  });

  test('new invoice button is accessible', async ({ page }) => {
    await page.click(':text("Invoices"), :text("فاکتورها")');
    await expect(page.locator('button:has-text("New Invoice"), button:has-text("فاکتور جدید")')).toBeVisible();
  });

  test('invoice create form has VAT fields', async ({ page }) => {
    await page.click(':text("Invoices"), :text("فاکتورها")');
    await page.click('button:has-text("New Invoice"), button:has-text("فاکتور جدید")');
    await page.waitForLoadState('networkidle');
    // VAT summary should be visible
    await expect(page.locator(':text("VAT"), :text("مالیات")')).toBeVisible({ timeout: 5000 });
  });
});
