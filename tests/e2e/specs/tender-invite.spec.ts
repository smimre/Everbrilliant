// ══════════════════════════════════════════════════════════════
// E2E Tests: Tender Invite Link — External Company Onboarding
// Flow: organizer generates link → external company registers
//       via link → lands on tenders page and can bid
// ══════════════════════════════════════════════════════════════
import { test, expect, Page } from '@playwright/test';

const BASE = process.env.BASE_URL || 'https://187.127.88.138.nip.io';
const API  = `${BASE}/api`;
const ADMIN = { phone: '09000000000', password: 'Admin@1234' };

async function getAdminToken(): Promise<string> {
  const res = await fetch(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(ADMIN),
  });
  const data = await res.json();
  return data.accessToken;
}

async function createTender(token: string): Promise<string> {
  const res = await fetch(`${API}/trading/tenders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      type: 'TENDER',
      title: `E2E Invite Test ${Date.now()}`,
      endDate: '2026-12-31',
      products: [{ name: 'آهن آلات', qty: 50, unit: 'ton', currency: 'IRR' }],
    }),
  });
  const data = await res.json();
  return data.id;
}

async function generateInvite(token: string, tenderId: string): Promise<string> {
  const res = await fetch(`${API}/trading/tenders/${tenderId}/invite`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  return data.token;
}

// ── Unique phone for each test run to avoid conflicts ─────────
function uniquePhone(): string {
  return '091' + String(Date.now()).slice(-8);
}

test.describe('Tender Invite Link', () => {

  test('invite page loads with tender details', async ({ page }) => {
    const token = await getAdminToken();
    const tenderId = await createTender(token);
    const inviteToken = await generateInvite(token, tenderId);

    await page.goto(`${BASE}/invite/${inviteToken}`);
    await page.waitForLoadState('networkidle');

    // Shows invite badge
    await expect(page.locator('text=دعوت به شرکت در مناقصه')).toBeVisible();
    // Shows inviter company name
    await expect(page.locator('text=شما را دعوت کرده')).toBeVisible();
    // Shows tender title
    await expect(page.locator('text=E2E Invite Test')).toBeVisible();
    // Shows free feature list
    await expect(page.locator('text=شرکت در مناقصه و مزایده')).toBeVisible();
    // Shows register and login buttons
    await expect(page.locator('button:has-text("ثبت‌نام")')).toBeVisible();
    await expect(page.locator('button:has-text("قبلاً حساب دارم")')).toBeVisible();
  });

  test('invalid invite token shows error', async ({ page }) => {
    await page.goto(`${BASE}/invite/this-token-does-not-exist`);
    await page.waitForLoadState('networkidle');
    await expect(page.locator('text=لینک معتبر نیست')).toBeVisible();
  });

  test('external company can register via invite link and reach tenders', async ({ page }) => {
    test.setTimeout(60_000);
    const token = await getAdminToken();
    const tenderId = await createTender(token);
    const inviteToken = await generateInvite(token, tenderId);
    const phone = uniquePhone();

    // Open invite page (not logged in)
    await page.goto(`${BASE}/invite/${inviteToken}`);
    await page.waitForLoadState('networkidle');

    // Click the landing "register" button (first of two similar-text buttons)
    await page.locator('button:has-text("ثبت‌نام و شرکت در مناقصه")').first().click();
    await page.waitForTimeout(400);

    // Fill form
    await page.locator('input').nth(0).fill('کاربر تست دعوت');
    await page.locator('input').nth(1).fill('شرکت نمونه E2E');
    await page.locator('input').nth(2).fill(phone);
    await page.locator('input').nth(3).fill('Test@1234');

    // Submit and wait for API response
    const [regRes] = await Promise.all([
      page.waitForResponse(r => r.url().includes('/api/auth/register'), { timeout: 15_000 }),
      page.locator('button:has-text("ثبت‌نام و شرکت در مناقصه")').last().click(),
    ]);

    expect(regRes.status()).toBe(201);

    // Should redirect to /tenders
    await page.waitForURL(`**\/tenders**`, { timeout: 15_000 });
    expect(page.url()).toContain('/tenders');
  });

  test('organizer can generate invite link from tender-manage page', async ({ page }) => {
    test.setTimeout(60_000);
    const adminToken = await getAdminToken();
    await createTender(adminToken);

    // Login as admin
    await page.goto(`${BASE}/login`);
    await page.waitForLoadState('networkidle');
    await page.locator('input').nth(0).fill(ADMIN.phone);
    await page.locator('input[type="password"]').fill(ADMIN.password);
    await Promise.all([
      page.waitForResponse(r => r.url().includes('auth/login'), { timeout: 15_000 }),
      page.click('button[type="submit"]'),
    ]);
    await page.waitForURL('**/dashboard**', { timeout: 20_000 });

    // Set token for in-page API calls
    await page.evaluate((t) => {
      const stored = JSON.parse(localStorage.getItem('everbrilliant-auth') || '{}');
      if (stored.state) stored.state.accessToken = t;
      localStorage.setItem('everbrilliant-auth', JSON.stringify(stored));
    }, adminToken);

    // Go to tender manage
    await page.goto(`${BASE}/trading/tender-manage`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Invite button should be visible on open tenders
    await expect(page.locator('button:has-text("Invite")').first()).toBeVisible({ timeout: 8_000 });

    // Click invite button on first tender
    await page.locator('button:has-text("Invite")').first().click();
    await page.waitForTimeout(400);

    // Modal should open
    await expect(page.locator('text=Share Invite Link')).toBeVisible();

    // Click Generate
    await page.click('button:has-text("Generate")');
    await page.waitForTimeout(2000);

    // Link should appear and contain /invite/
    const linkText = await page.locator('span.font-mono').textContent();
    expect(linkText).toContain('/invite/');
    expect(linkText).not.toContain('/invite/undefined');

    // Share buttons should be visible
    await expect(page.locator('text=WhatsApp')).toBeVisible();
    await expect(page.locator('text=SMS')).toBeVisible();
    await expect(page.locator('text=Email')).toBeVisible();
    await expect(page.locator('text=30 days')).toBeVisible();
  });

});
