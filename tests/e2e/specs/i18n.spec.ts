// ══════════════════════════════════════════════════════════════
// E2E Tests: i18n — Arabic (ar) labels and RTL layout
// ══════════════════════════════════════════════════════════════
import { test, expect } from '@playwright/test';
import { login } from '../helpers/auth';

// Switch to Arabic via the language selector in the topbar
async function switchToArabic(page: import('@playwright/test').Page) {
  // Open the language selector dropdown
  await page.click('button:has-text("English"), button:has-text("فارسی"), button:has-text("العربية"), button:has-text("हिन्दी")');
  // Click the Arabic option
  await page.click('button:has-text("العربية")');
  // Give React/Zustand time to update DOM
  await page.waitForTimeout(300);
}

test.describe('i18n — Arabic / RTL', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  // ── RTL document direction ────────────────────────────────
  test('switching to Arabic sets dir=rtl on <html>', async ({ page }) => {
    await switchToArabic(page);
    const dir = await page.evaluate(() => document.documentElement.dir);
    expect(dir).toBe('rtl');
  });

  test('switching to Arabic sets lang=ar on <html>', async ({ page }) => {
    await switchToArabic(page);
    const lang = await page.evaluate(() => document.documentElement.lang);
    expect(lang).toBe('ar');
  });

  // ── Module switcher tabs ──────────────────────────────────
  test('module switcher shows Arabic label for Trading', async ({ page }) => {
    await switchToArabic(page);
    await expect(page.locator('button:has-text("التجارة"), a:has-text("التجارة")')).toBeVisible();
  });

  test('module switcher shows Arabic label for Finance', async ({ page }) => {
    await switchToArabic(page);
    await expect(page.locator('button:has-text("المالية"), a:has-text("المالية")')).toBeVisible();
  });

  test('module switcher shows Arabic label for Automation', async ({ page }) => {
    await switchToArabic(page);
    await expect(page.locator('button:has-text("الأتمتة"), a:has-text("الأتمتة")')).toBeVisible();
  });

  test('module switcher shows Arabic label for Manufacturing', async ({ page }) => {
    await switchToArabic(page);
    await expect(page.locator('button:has-text("التصنيع"), a:has-text("التصنيع")')).toBeVisible();
  });

  test('module switcher shows Arabic label for Logistics', async ({ page }) => {
    await switchToArabic(page);
    await expect(page.locator('button:has-text("اللوجستية"), a:has-text("اللوجستية")')).toBeVisible();
  });

  // ── Trading sidebar nav ───────────────────────────────────
  test('sidebar shows Arabic label: لوحة القيادة (Dashboard)', async ({ page }) => {
    await switchToArabic(page);
    await expect(page.locator('nav button:has-text("لوحة القيادة"), nav a:has-text("لوحة القيادة")')).toBeVisible();
  });

  test('sidebar shows Arabic label: صندوق الوارد (Inbox)', async ({ page }) => {
    await switchToArabic(page);
    await expect(page.locator('nav button:has-text("صندوق الوارد"), nav a:has-text("صندوق الوارد")')).toBeVisible();
  });

  test('sidebar shows Arabic label: طلباتي (My Requests)', async ({ page }) => {
    await switchToArabic(page);
    await expect(page.locator('nav button:has-text("طلباتي"), nav a:has-text("طلباتي")')).toBeVisible();
  });

  test('sidebar shows Arabic label: العقود (Contracts)', async ({ page }) => {
    await switchToArabic(page);
    await expect(page.locator('nav button:has-text("العقود"), nav a:has-text("العقود")')).toBeVisible();
  });

  test('sidebar shows Arabic label: المناقصات (Tenders)', async ({ page }) => {
    await switchToArabic(page);
    await expect(page.locator('nav button:has-text("المناقصات"), nav a:has-text("المناقصات")')).toBeVisible();
  });

  test('sidebar shows Arabic label: التقارير (Reports)', async ({ page }) => {
    await switchToArabic(page);
    await expect(page.locator('nav button:has-text("التقارير"), nav a:has-text("التقارير")')).toBeVisible();
  });

  test('sidebar shows Arabic label: إدارة العملاء (CRM)', async ({ page }) => {
    await switchToArabic(page);
    await expect(page.locator('nav button:has-text("إدارة العملاء"), nav a:has-text("إدارة العملاء")')).toBeVisible();
  });

  test('sidebar shows Arabic label: الاتصالات (Connections)', async ({ page }) => {
    await switchToArabic(page);
    await expect(page.locator('nav button:has-text("الاتصالات"), nav a:has-text("الاتصالات")')).toBeVisible();
  });

  // ── Sidebar footer actions ────────────────────────────────
  test('sidebar footer shows Arabic: الإعدادات (Settings)', async ({ page }) => {
    await switchToArabic(page);
    await expect(page.locator('aside button:has-text("الإعدادات")')).toBeVisible();
  });

  test('sidebar footer shows Arabic: تسجيل الخروج (Logout)', async ({ page }) => {
    await switchToArabic(page);
    await expect(page.locator('aside button:has-text("تسجيل الخروج")')).toBeVisible();
  });

  // ── Settings page tabs ────────────────────────────────────
  test('settings page shows Arabic tab: الملف الشخصي (Profile)', async ({ page }) => {
    await switchToArabic(page);
    await page.goto('/settings');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('button:has-text("الملف الشخصي")')).toBeVisible();
  });

  test('settings page shows Arabic tab: اللغة (Language)', async ({ page }) => {
    await switchToArabic(page);
    await page.goto('/settings');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('button:has-text("اللغة")')).toBeVisible();
  });

  test('settings page shows Arabic tab: الأمان (Security)', async ({ page }) => {
    await switchToArabic(page);
    await page.goto('/settings');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('button:has-text("الأمان")')).toBeVisible();
  });

  test('settings page shows Arabic tab: الإشعارات (Notifications)', async ({ page }) => {
    await switchToArabic(page);
    await page.goto('/settings');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('button:has-text("الإشعارات")')).toBeVisible();
  });

  test('settings page shows Arabic tab: مستخدمو الشركة (Company Users)', async ({ page }) => {
    await switchToArabic(page);
    await page.goto('/settings');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('button:has-text("مستخدمو الشركة")')).toBeVisible();
  });

  test('settings page shows Arabic tab: الأدوار (Roles)', async ({ page }) => {
    await switchToArabic(page);
    await page.goto('/settings');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('button:has-text("الأدوار")')).toBeVisible();
  });

  test('settings page shows Arabic tab: معلومات الشركة (Company Info)', async ({ page }) => {
    await switchToArabic(page);
    await page.goto('/settings');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('button:has-text("معلومات الشركة")')).toBeVisible();
  });

  // ── Finance sidebar (cross-module) ────────────────────────
  test('finance sidebar shows Arabic label: نظرة عامة (Overview)', async ({ page }) => {
    await switchToArabic(page);
    // Switch to Finance module
    const financeTab = page.locator('button:has-text("المالية"), a:has-text("المالية")').first();
    if (await financeTab.count() > 0) {
      await financeTab.click();
      await page.waitForTimeout(300);
    } else {
      await page.goto('/finance');
    }
    await expect(page.locator('nav button:has-text("نظرة عامة"), nav a:has-text("نظرة عامة")')).toBeVisible({ timeout: 5000 });
  });

  test('finance sidebar shows Arabic label: الفواتير (Invoices)', async ({ page }) => {
    await switchToArabic(page);
    await page.goto('/finance');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('nav button:has-text("الفواتير"), nav a:has-text("الفواتير")')).toBeVisible({ timeout: 5000 });
  });

  // ── Automation sidebar ────────────────────────────────────
  test('automation sidebar shows Arabic label: الطلبات (Requests)', async ({ page }) => {
    await switchToArabic(page);
    await page.goto('/automation');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('nav button:has-text("الطلبات"), nav a:has-text("الطلبات")')).toBeVisible({ timeout: 5000 });
  });

  test('automation sidebar shows Arabic label: المهام (Tasks)', async ({ page }) => {
    await switchToArabic(page);
    await page.goto('/automation');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('nav button:has-text("المهام"), nav a:has-text("المهام")')).toBeVisible({ timeout: 5000 });
  });

  // ── Language selector UI ──────────────────────────────────
  test('language selector highlights العربية as active after switching', async ({ page }) => {
    await switchToArabic(page);
    // Open the selector again to inspect active state
    await page.click('button:has-text("العربية")');
    const activeOption = page.locator('button:has-text("العربية") ~ span:has-text("✓"), button:has-text("العربية").font-semibold');
    // At minimum the button itself should still be present and the checkmark visible
    const checkmark = page.locator(':text("✓")');
    await expect(checkmark).toBeVisible({ timeout: 3000 });
  });

  // ── Persistence across page navigation ───────────────────
  test('Arabic locale persists after navigating to a different route', async ({ page }) => {
    await switchToArabic(page);
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    const dir = await page.evaluate(() => document.documentElement.dir);
    expect(dir).toBe('rtl');
    const lang = await page.evaluate(() => document.documentElement.lang);
    expect(lang).toBe('ar');
  });
});
