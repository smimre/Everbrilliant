// ══════════════════════════════════════════════════════════════
// E2E Tests: Trading Module
// ══════════════════════════════════════════════════════════════
import { test, expect } from '@playwright/test';
import { login } from '../helpers/auth';

test.describe('Trading Module', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.click('button:has-text("Trading"), button:has-text("بازرگانی")');
    await page.waitForLoadState('networkidle');
  });

  test('trading dashboard shows KPI cards', async ({ page }) => {
    await expect(page.locator(':text("Pending"), :text("در انتظار")')).toBeVisible({ timeout: 5000 });
  });

  test('can navigate to requests list', async ({ page }) => {
    await page.click(':text("Requests"), :text("درخواست‌ها"), a[href*="requests"]');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('button:has-text("New Request"), button:has-text("درخواست جدید")')).toBeVisible({ timeout: 5000 });
  });

  test('requests list has search input', async ({ page }) => {
    await page.click(':text("Requests"), :text("درخواست‌ها")');
    await page.waitForLoadState('networkidle');
    const search = page.locator('input[placeholder*="Search"], input[placeholder*="جستجو"]');
    await expect(search).toBeVisible({ timeout: 5000 });
  });

  test('can navigate to tenders', async ({ page }) => {
    await page.click(':text("Tenders"), :text("مزایده")');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('h1:has-text("Tender"), h1:has-text("مزایده")')).toBeVisible({ timeout: 5000 });
  });

  test('can navigate to contracts', async ({ page }) => {
    await page.click(':text("Contracts"), :text("قرارداد")');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('button:has-text("New Contract"), button:has-text("جدید")')).toBeVisible({ timeout: 5000 });
  });

  test('new request button is accessible on all viewports', async ({ page }) => {
    await page.click(':text("Requests"), :text("درخواست‌ها")');
    await page.waitForLoadState('networkidle');
    const btn = page.locator('button:has-text("New Request"), button:has-text("درخواست جدید")');
    await expect(btn).toBeVisible();
    const box = await btn.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.height).toBeGreaterThanOrEqual(36);
  });
});
