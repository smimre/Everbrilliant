import { Page } from '@playwright/test';

export const TEST_USERS = {
  admin:   { phone: '09121111111', password: 'Admin@1234', name: 'احمد رضایی' },
  finance: { phone: '09121111113', password: 'User@5678',  name: 'فاطمه رضایی' },
  buyer:   { phone: '09121111112', password: 'User@5678',  name: 'علی کریمی' },
};

export async function login(page: Page, user: keyof typeof TEST_USERS = 'admin') {
  const creds = TEST_USERS[user];
  await page.goto('/login');
  await page.waitForLoadState('networkidle');
  await page.fill('[placeholder*="Phone"], [placeholder*="09"]', creds.phone);
  await page.fill('[type="password"]', creds.password);
  await page.click('[type="submit"]');
  await page.waitForURL('**/dashboard**', { timeout: 10_000 });
}

export async function logout(page: Page) {
  await page.click('[aria-label="User menu"], button:has-text("Sign Out")');
  await page.waitForURL('**/login**');
}
