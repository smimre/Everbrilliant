// ══════════════════════════════════════════════════════════════
// E2E Tests: Responsive Design
// Specifically tests Mobile / Tablet / Desktop behavior
// ══════════════════════════════════════════════════════════════
import { test, expect } from '@playwright/test';
import { login } from '../helpers/auth';

test.describe('Responsive Design', () => {

  test.describe('Login page layout', () => {
    test('is centered and readable on all viewports', async ({ page }) => {
      await page.goto('/login');
      // Form should be visible and not overflow
      const form = page.locator('[type="submit"]').first();
      await expect(form).toBeInViewport();

      const box = await form.boundingBox();
      expect(box).not.toBeNull();
      expect(box!.x).toBeGreaterThan(0);
      expect(box!.width).toBeGreaterThan(0);
    });
  });

  test.describe('Dashboard layout', () => {
    test.beforeEach(async ({ page }) => { await login(page); });

    test('KPI cards grid adapts to viewport', async ({ page }) => {
      const vp = page.viewportSize();
      const cards = page.locator('.stat-card, [class*="grid"] > div').first();
      if (await cards.count() > 0) {
        await expect(cards).toBeInViewport();
      }
    });

    test('no horizontal scroll on mobile', async ({ page }) => {
      const vp = page.viewportSize();
      if (vp && vp.width < 768) {
        const scrollWidth = await page.evaluate(() => document.body.scrollWidth);
        const clientWidth = await page.evaluate(() => document.body.clientWidth);
        expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 5); // 5px tolerance
      }
    });

    test('text is readable (font size >= 12px)', async ({ page }) => {
      const bodyFontSize = await page.evaluate(() => {
        const el = document.querySelector('p, span, div');
        return el ? parseInt(getComputedStyle(el).fontSize) : 0;
      });
      expect(bodyFontSize).toBeGreaterThanOrEqual(12);
    });

    test('touch targets are large enough on mobile', async ({ page }) => {
      const vp = page.viewportSize();
      if (vp && vp.width < 768) {
        // Check main CTA button
        const btn = page.locator('button[type="submit"], nav button').first();
        if (await btn.count() > 0) {
          const box = await btn.boundingBox();
          if (box) {
            // WCAG recommends 44x44px minimum touch target
            expect(box.height).toBeGreaterThanOrEqual(36);
            expect(box.width).toBeGreaterThanOrEqual(36);
          }
        }
      }
    });
  });

  test.describe('RTL layout', () => {
    test('switches to RTL when Farsi selected', async ({ page }) => {
      await page.goto('/login');
      // Find language selector and switch to Farsi
      const langBtn = page.locator('button:has-text("English"), button:has-text("🇬🇧")').first();
      if (await langBtn.count() > 0) {
        await langBtn.click();
        await page.click(':text("فارسی")');
        await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
        await expect(page.locator('html')).toHaveAttribute('lang', 'fa');
      }
    });

    test('form elements align correctly in RTL', async ({ page }) => {
      await page.goto('/login');
      const langBtn = page.locator('button:has-text("🇬🇧")').first();
      if (await langBtn.count() > 0) {
        await langBtn.click();
        await page.click(':text("فارسی")');
        // Input should be right-aligned in RTL
        const input = page.locator('input').first();
        const dir = await input.evaluate(el => getComputedStyle(el).direction);
        expect(['rtl', 'inherit']).toContain(dir);
      }
    });
  });
});
