// ══════════════════════════════════════════════════════════════
// E2E Tests: Dashboard — all devices
// ══════════════════════════════════════════════════════════════
import { test, expect } from '@playwright/test';
import { login } from '../helpers/auth';

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => { await login(page); });

  test('shows KPI stat cards', async ({ page }) => {
    await expect(page.locator('.stat-card, [class*="StatCard"]').first()).toBeVisible();
  });

  test('shows module switcher tabs', async ({ page }) => {
    const tabs = ['Trading', 'Finance', 'Automation', 'بازرگانی', 'مالی'];
    for (const tab of tabs) {
      const el = page.locator(`button:has-text("${tab}")`);
      if (await el.count() > 0) {
        await expect(el.first()).toBeVisible();
        break;
      }
    }
  });

  test('sidebar is visible on desktop', async ({ page, browserName }) => {
    const vp = page.viewportSize();
    if (vp && vp.width >= 768) {
      await expect(page.locator('nav, aside')).toBeVisible();
    }
  });

  test('sidebar collapses on mobile', async ({ page }) => {
    const vp = page.viewportSize();
    if (vp && vp.width < 768) {
      // Sidebar should be hidden by default on mobile
      const sidebar = page.locator('aside');
      const width = await sidebar.evaluate(el => el.getBoundingClientRect().width);
      expect(width).toBe(0);
    }
  });

  test('hamburger menu works on mobile', async ({ page }) => {
    const vp = page.viewportSize();
    if (vp && vp.width < 768) {
      await page.click('[aria-label="Toggle menu"], button:has(.hamburger)');
      await expect(page.locator('aside, nav')).toBeVisible();
    }
  });

  test('module switch loads trading module', async ({ page }) => {
    await page.click('button:has-text("Trading"), button:has-text("بازرگانی")');
    await expect(page.locator(':text("Requests"), :text("درخواست")')).toBeVisible({ timeout: 5000 });
  });

  test('module switch loads finance module', async ({ page }) => {
    await page.click('button:has-text("Finance"), button:has-text("مالی")');
    await expect(page.locator(':text("Invoice"), :text("فاکتور")')).toBeVisible({ timeout: 5000 });
  });

  test('notification bell is present', async ({ page }) => {
    await expect(page.locator('button:has([data-lucide="bell"]), [aria-label*="notification"]')).toBeVisible();
  });
});
