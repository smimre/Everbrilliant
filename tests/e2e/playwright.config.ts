// ══════════════════════════════════════════════════════════════
// Playwright E2E Configuration
// ══════════════════════════════════════════════════════════════
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './specs',
  timeout: 30_000,
  expect: { timeout: 5_000 },
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'test-results.json' }],
    process.env.CI ? ['github'] : ['list'],
  ] as any,

  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3001',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    locale: 'fa-IR',
  },

  projects: [
    // ── Desktop ─────────────────────────────────────────────────
    {
      name: 'Desktop Chrome',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 800 } },
    },
    {
      name: 'Desktop Firefox',
      use: { ...devices['Desktop Firefox'], viewport: { width: 1280, height: 800 } },
    },
    {
      name: 'Desktop Safari',
      use: { ...devices['Desktop Safari'], viewport: { width: 1280, height: 800 } },
    },

    // ── Tablet ──────────────────────────────────────────────────
    {
      name: 'iPad Pro',
      use: { ...devices['iPad Pro'], locale: 'en-US' },
    },
    {
      name: 'iPad Mini',
      use: { ...devices['iPad Mini'] },
    },

    // ── Mobile ──────────────────────────────────────────────────
    {
      name: 'Mobile Chrome (Pixel 7)',
      use: { ...devices['Pixel 7'] },
    },
    {
      name: 'Mobile Safari (iPhone 14)',
      use: { ...devices['iPhone 14'] },
    },
    {
      name: 'Mobile Safari RTL (iPhone 14 - FA)',
      use: { ...devices['iPhone 14'], locale: 'fa-IR', timezoneId: 'Asia/Tehran' },
    },
  ],

  webServer: {
    command: 'npm run start',
    url: 'http://localhost:3001',
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
