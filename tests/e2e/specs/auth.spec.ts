// ══════════════════════════════════════════════════════════════
// E2E Tests: Authentication Flow
// Devices: Mobile, Tablet, Desktop
// ══════════════════════════════════════════════════════════════
import { test, expect, Page } from '@playwright/test';
import { login, TEST_USERS } from '../helpers/auth';

test.describe('Authentication', () => {

  test.describe('Login page', () => {
    test('shows login form on all devices', async ({ page }) => {
      await page.goto('/login');
      await expect(page).toHaveTitle(/Everbrilliant/);
      await expect(page.locator('[type="submit"]')).toBeVisible();
      await expect(page.locator('[type="password"]')).toBeVisible();
    });

    test('shows language selector', async ({ page }) => {
      await page.goto('/login');
      // Language dropdown exists
      await expect(page.locator('button:has-text("English"), button:has-text("فارسی")')).toBeVisible();
    });

    test('switches to Farsi RTL correctly', async ({ page }) => {
      await page.goto('/login');
      await page.click('button:has-text("English"), button:has-text("🇬🇧")');
      await page.click('button:has-text("فارسی"), :text("فارسی")');
      await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
    });

    test('shows validation errors for empty form', async ({ page }) => {
      await page.goto('/login');
      await page.click('[type="submit"]');
      // Should show validation error
      await expect(page.locator('.text-\\[hsl\\(var\\(--destructive\\)\\)\\]')).toBeVisible();
    });

    test('shows error for wrong credentials', async ({ page }) => {
      await page.goto('/login');
      await page.fill('[placeholder*="Phone"], input[type="tel"]', '09121111111');
      await page.fill('[type="password"]', 'WrongPassword');
      await page.click('[type="submit"]');
      await expect(page.locator(':text("Invalid"), :text("اشتباه")')).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('Successful login', () => {
    test('redirects to dashboard after login', async ({ page }) => {
      await login(page, 'admin');
      await expect(page).toHaveURL(/dashboard/);
    });

    test('dashboard loads with user name', async ({ page }) => {
      await login(page, 'admin');
      await expect(page.locator(':text("احمد"), :text("Ahmad")')).toBeVisible();
    });

    test('persists session on page refresh', async ({ page }) => {
      await login(page, 'admin');
      await page.reload();
      await expect(page).toHaveURL(/dashboard/);
    });
  });
});
