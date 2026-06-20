// ══════════════════════════════════════════════════════════════
// E2E Tests: i18n — Hindi (hi) labels and LTR layout
// ══════════════════════════════════════════════════════════════
import { test, expect } from '@playwright/test';
import { login } from '../helpers/auth';

async function switchToHindi(page: import('@playwright/test').Page) {
  await page.click('button:has-text("English"), button:has-text("فارسی"), button:has-text("العربية"), button:has-text("हिन्दी")');
  await page.click('button:has-text("हिन्दी")');
  await page.waitForTimeout(300);
}

test.describe('i18n — Hindi / LTR', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  // ── Document direction & lang ─────────────────────────────
  test('switching to Hindi sets lang=hi on <html>', async ({ page }) => {
    await switchToHindi(page);
    const lang = await page.evaluate(() => document.documentElement.lang);
    expect(lang).toBe('hi');
  });

  test('switching to Hindi keeps dir=ltr on <html>', async ({ page }) => {
    await switchToHindi(page);
    const dir = await page.evaluate(() => document.documentElement.dir);
    expect(dir).toBe('ltr');
  });

  // ── Module switcher tabs ──────────────────────────────────
  test('module switcher shows Hindi label for Trading: व्यापार', async ({ page }) => {
    await switchToHindi(page);
    await expect(page.locator('button:has-text("व्यापार"), a:has-text("व्यापार")')).toBeVisible();
  });

  test('module switcher shows Hindi label for Finance: वित्त', async ({ page }) => {
    await switchToHindi(page);
    await expect(page.locator('button:has-text("वित्त"), a:has-text("वित्त")')).toBeVisible();
  });

  test('module switcher shows Hindi label for Automation: स्वचालन', async ({ page }) => {
    await switchToHindi(page);
    await expect(page.locator('button:has-text("स्वचालन"), a:has-text("स्वचालन")')).toBeVisible();
  });

  test('module switcher shows Hindi label for Manufacturing: विनिर्माण', async ({ page }) => {
    await switchToHindi(page);
    await expect(page.locator('button:has-text("विनिर्माण"), a:has-text("विनिर्माण")')).toBeVisible();
  });

  test('module switcher shows Hindi label for Logistics: लॉजिस्टिक्स', async ({ page }) => {
    await switchToHindi(page);
    await expect(page.locator('button:has-text("लॉजिस्टिक्स"), a:has-text("लॉजिस्टिक्स")')).toBeVisible();
  });

  // ── Trading sidebar nav ───────────────────────────────────
  test('sidebar shows Hindi label: डैशबोर्ड (Dashboard)', async ({ page }) => {
    await switchToHindi(page);
    await expect(page.locator('nav button:has-text("डैशबोर्ड"), nav a:has-text("डैशबोर्ड")')).toBeVisible();
  });

  test('sidebar shows Hindi label: इनबॉक्स (Inbox)', async ({ page }) => {
    await switchToHindi(page);
    await expect(page.locator('nav button:has-text("इनबॉक्स"), nav a:has-text("इनबॉक्स")')).toBeVisible();
  });

  test('sidebar shows Hindi label: मेरे अनुरोध (My Requests)', async ({ page }) => {
    await switchToHindi(page);
    await expect(page.locator('nav button:has-text("मेरे अनुरोध"), nav a:has-text("मेरे अनुरोध")')).toBeVisible();
  });

  test('sidebar shows Hindi label: अनुबंध (Contracts)', async ({ page }) => {
    await switchToHindi(page);
    await expect(page.locator('nav button:has-text("अनुबंध"), nav a:has-text("अनुबंध")')).toBeVisible();
  });

  test('sidebar shows Hindi label: निविदाएं (Tenders)', async ({ page }) => {
    await switchToHindi(page);
    await expect(page.locator('nav button:has-text("निविदाएं"), nav a:has-text("निविदाएं")')).toBeVisible();
  });

  test('sidebar shows Hindi label: रिपोर्ट (Reports)', async ({ page }) => {
    await switchToHindi(page);
    await expect(page.locator('nav button:has-text("रिपोर्ट"), nav a:has-text("रिपोर्ट")')).toBeVisible();
  });

  test('sidebar shows Hindi label: सीआरएम (CRM)', async ({ page }) => {
    await switchToHindi(page);
    await expect(page.locator('nav button:has-text("सीआरएम"), nav a:has-text("सीआरएम")')).toBeVisible();
  });

  test('sidebar shows Hindi label: कनेक्शन (Connections)', async ({ page }) => {
    await switchToHindi(page);
    await expect(page.locator('nav button:has-text("कनेक्शन"), nav a:has-text("कनेक्शन")')).toBeVisible();
  });

  test('sidebar shows Hindi label: मेरे भुगतान (My Payments)', async ({ page }) => {
    await switchToHindi(page);
    await expect(page.locator('nav button:has-text("मेरे भुगतान"), nav a:has-text("मेरे भुगतान")')).toBeVisible();
  });

  test('sidebar shows Hindi label: मेरे चालान (My Invoices)', async ({ page }) => {
    await switchToHindi(page);
    await expect(page.locator('nav button:has-text("मेरे चालान"), nav a:has-text("मेरे चालान")')).toBeVisible();
  });

  // ── Sidebar footer actions ────────────────────────────────
  test('sidebar footer shows Hindi: सेटिंग्स (Settings)', async ({ page }) => {
    await switchToHindi(page);
    await expect(page.locator('aside button:has-text("सेटिंग्स")')).toBeVisible();
  });

  test('sidebar footer shows Hindi: लॉगआउट (Logout)', async ({ page }) => {
    await switchToHindi(page);
    await expect(page.locator('aside button:has-text("लॉगआउट")')).toBeVisible();
  });

  // ── Settings page tabs ────────────────────────────────────
  test('settings page shows Hindi tab: प्रोफाइल (Profile)', async ({ page }) => {
    await switchToHindi(page);
    await page.goto('/settings');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('button:has-text("प्रोफाइल")')).toBeVisible();
  });

  test('settings page shows Hindi tab: भाषा (Language)', async ({ page }) => {
    await switchToHindi(page);
    await page.goto('/settings');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('button:has-text("भाषा")')).toBeVisible();
  });

  test('settings page shows Hindi tab: सुरक्षा (Security)', async ({ page }) => {
    await switchToHindi(page);
    await page.goto('/settings');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('button:has-text("सुरक्षा")')).toBeVisible();
  });

  test('settings page shows Hindi tab: सूचनाएं (Notifications)', async ({ page }) => {
    await switchToHindi(page);
    await page.goto('/settings');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('button:has-text("सूचनाएं")')).toBeVisible();
  });

  test('settings page shows Hindi tab: कंपनी उपयोगकर्ता (Company Users)', async ({ page }) => {
    await switchToHindi(page);
    await page.goto('/settings');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('button:has-text("कंपनी उपयोगकर्ता")')).toBeVisible();
  });

  test('settings page shows Hindi tab: भूमिकाएं (Roles)', async ({ page }) => {
    await switchToHindi(page);
    await page.goto('/settings');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('button:has-text("भूमिकाएं")')).toBeVisible();
  });

  test('settings page shows Hindi tab: कंपनी जानकारी (Company Info)', async ({ page }) => {
    await switchToHindi(page);
    await page.goto('/settings');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('button:has-text("कंपनी जानकारी")')).toBeVisible();
  });

  test('settings page shows Hindi tab: रूप-रंग (Appearance)', async ({ page }) => {
    await switchToHindi(page);
    await page.goto('/settings');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('button:has-text("रूप-रंग")')).toBeVisible();
  });

  // ── Finance sidebar ───────────────────────────────────────
  test('finance sidebar shows Hindi label: अवलोकन (Overview)', async ({ page }) => {
    await switchToHindi(page);
    await page.goto('/finance');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('nav button:has-text("अवलोकन"), nav a:has-text("अवलोकन")')).toBeVisible({ timeout: 5000 });
  });

  test('finance sidebar shows Hindi label: चालान (Invoices)', async ({ page }) => {
    await switchToHindi(page);
    await page.goto('/finance');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('nav button:has-text("चालान"), nav a:has-text("चालान")')).toBeVisible({ timeout: 5000 });
  });

  test('finance sidebar shows Hindi label: इन्वेंटरी (Inventory)', async ({ page }) => {
    await switchToHindi(page);
    await page.goto('/finance');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('nav button:has-text("इन्वेंटरी"), nav a:has-text("इन्वेंटरी")')).toBeVisible({ timeout: 5000 });
  });

  test('finance sidebar shows Hindi label: कोषागार (Treasury)', async ({ page }) => {
    await switchToHindi(page);
    await page.goto('/finance');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('nav button:has-text("कोषागार"), nav a:has-text("कोषागार")')).toBeVisible({ timeout: 5000 });
  });

  // ── Automation sidebar ────────────────────────────────────
  test('automation sidebar shows Hindi label: अनुरोध (Requests)', async ({ page }) => {
    await switchToHindi(page);
    await page.goto('/automation');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('nav button:has-text("अनुरोध"), nav a:has-text("अनुरोध")')).toBeVisible({ timeout: 5000 });
  });

  test('automation sidebar shows Hindi label: कार्य (Tasks)', async ({ page }) => {
    await switchToHindi(page);
    await page.goto('/automation');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('nav button:has-text("कार्य"), nav a:has-text("कार्य")')).toBeVisible({ timeout: 5000 });
  });

  test('automation sidebar shows Hindi label: बैठकें (Meetings)', async ({ page }) => {
    await switchToHindi(page);
    await page.goto('/automation');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('nav button:has-text("बैठकें"), nav a:has-text("बैठकें")')).toBeVisible({ timeout: 5000 });
  });

  test('automation sidebar shows Hindi label: कार्यप्रवाह (Workflows)', async ({ page }) => {
    await switchToHindi(page);
    await page.goto('/automation');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('nav button:has-text("कार्यप्रवाह"), nav a:has-text("कार्यप्रवाह")')).toBeVisible({ timeout: 5000 });
  });

  // ── Language selector ─────────────────────────────────────
  test('language selector shows हिन्दी as active after switching', async ({ page }) => {
    await switchToHindi(page);
    // Open the selector and verify checkmark is on हिन्दी
    await page.click('button:has-text("हिन्दी")');
    await expect(page.locator(':text("✓")')).toBeVisible({ timeout: 3000 });
  });

  // ── Locale persistence ────────────────────────────────────
  test('Hindi locale persists after navigating to a different route', async ({ page }) => {
    await switchToHindi(page);
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    const lang = await page.evaluate(() => document.documentElement.lang);
    expect(lang).toBe('hi');
  });

  test('Hindi locale persists after navigating to settings', async ({ page }) => {
    await switchToHindi(page);
    await page.goto('/settings');
    await page.waitForLoadState('networkidle');
    const lang = await page.evaluate(() => document.documentElement.lang);
    expect(lang).toBe('hi');
  });
});
