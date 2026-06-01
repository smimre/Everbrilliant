// ══════════════════════════════════════════════════════════════
// E2E Tests: Automation Module
// ══════════════════════════════════════════════════════════════
import { test, expect } from '@playwright/test';
import { login } from '../helpers/auth';

test.describe('Automation Module', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.click('button:has-text("Automation"), button:has-text("اتوماسیون")');
    await page.waitForLoadState('networkidle');
  });

  test('automation dashboard shows navigation cards', async ({ page }) => {
    await expect(page.locator(':text("Correspondence"), :text("مکاتبات")')).toBeVisible({ timeout: 5000 });
    await expect(page.locator(':text("Meetings"), :text("جلسات")')).toBeVisible({ timeout: 5000 });
    await expect(page.locator(':text("Requests"), :text("درخواست‌ها")')).toBeVisible({ timeout: 5000 });
  });

  test('can open correspondence (letters)', async ({ page }) => {
    await page.click(':text("Correspondence"), :text("مکاتبات")');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('h1:has-text("Correspondence"), h1:has-text("مکاتبات")')).toBeVisible({ timeout: 5000 });
  });

  test('can navigate to workflow requests', async ({ page }) => {
    await page.click(':text("Requests"), :text("درخواست‌ها")');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('button:has-text("New Request"), button:has-text("جدید")')).toBeVisible({ timeout: 5000 });
  });

  test('can navigate to meetings', async ({ page }) => {
    await page.click(':text("Meetings"), :text("جلسات")');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('h1:has-text("Meeting"), h1:has-text("جلسات")')).toBeVisible({ timeout: 5000 });
  });

  test('back button works from sub-pages', async ({ page }) => {
    await page.click(':text("Meetings"), :text("جلسات")');
    await page.waitForLoadState('networkidle');
    await page.click('button:has-text("Dashboard"), button:has-text("داشبورد"), button:has-text("←")');
    await expect(page.locator(':text("Correspondence"), :text("مکاتبات")')).toBeVisible({ timeout: 5000 });
  });
});
