# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: i18n-hi.spec.ts >> i18n — Hindi / LTR >> automation sidebar shows Hindi label: अनुरोध (Requests)
- Location: specs/i18n-hi.spec.ts:206:7

# Error details

```
TimeoutError: page.waitForURL: Timeout 10000ms exceeded.
=========================== logs ===========================
waiting for navigation to "**/dashboard**" until "load"
============================================================
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e2]:
    - generic [ref=e3]:
      - generic:
        - img
      - generic [ref=e5]:
        - img [ref=e7]
        - generic [ref=e10]: Everbrilliant
      - generic [ref=e11]:
        - generic [ref=e12]:
          - heading "Complete B2B Trading & ERP" [level=2] [ref=e13]:
            - text: Complete B2B
            - text: Trading & ERP
          - paragraph [ref=e14]: Manage procurement, sales, tenders, accounting & manufacturing in one platform
        - generic [ref=e15]:
          - generic [ref=e16]:
            - generic [ref=e17]: 📦
            - generic [ref=e18]: Trade Requests & Contracts
          - generic [ref=e19]:
            - generic [ref=e20]: 💰
            - generic [ref=e21]: Finance & Accounting
          - generic [ref=e22]:
            - generic [ref=e23]: 🏭
            - generic [ref=e24]: Manufacturing & Logistics
          - generic [ref=e25]:
            - generic [ref=e26]: 🤝
            - generic [ref=e27]: B2B Connections
      - paragraph [ref=e29]: © 2025 Everbrilliant. All rights reserved.
    - generic [ref=e31]:
      - button "🇬🇧 English" [ref=e34] [cursor=pointer]:
        - generic [ref=e35]: 🇬🇧
        - generic [ref=e36]: English
        - img [ref=e37]
      - generic [ref=e39]:
        - generic [ref=e40]:
          - heading "Sign In" [level=1] [ref=e41]
          - paragraph [ref=e42]: B2B Trading & ERP Platform
        - generic [ref=e43]:
          - generic [ref=e44]: ⚠️
          - text: Network Error
        - generic [ref=e45]:
          - generic [ref=e46]:
            - generic [ref=e47]: Mobile or Username
            - textbox "Mobile or Username" [ref=e49]:
              - /placeholder: Phone number or username
              - text: "09121111111"
          - generic [ref=e50]:
            - generic [ref=e51]:
              - generic [ref=e52]: Password
              - generic [ref=e53]:
                - textbox "Password" [ref=e54]:
                  - /placeholder: ••••••••
                  - text: Admin@1234
                - button [ref=e56] [cursor=pointer]:
                  - img [ref=e57]
            - link "Forgot password?" [ref=e61] [cursor=pointer]:
              - /url: /forgot-password
          - button "🔑 Sign In" [ref=e62] [cursor=pointer]:
            - generic [ref=e63]: 🔑
            - text: Sign In
        - generic [ref=e66]: Don't have an account?
        - link "Register →" [ref=e68] [cursor=pointer]:
          - /url: /register
  - alert [ref=e69]
```

# Test source

```ts
  1  | import { Page } from '@playwright/test';
  2  | 
  3  | export const TEST_USERS = {
  4  |   admin:   { phone: '09121111111', password: 'Admin@1234', name: 'احمد رضایی' },
  5  |   finance: { phone: '09121111113', password: 'User@5678',  name: 'فاطمه رضایی' },
  6  |   buyer:   { phone: '09121111112', password: 'User@5678',  name: 'علی کریمی' },
  7  | };
  8  | 
  9  | export async function login(page: Page, user: keyof typeof TEST_USERS = 'admin') {
  10 |   const creds = TEST_USERS[user];
  11 |   await page.goto('/login');
  12 |   await page.waitForLoadState('networkidle');
  13 |   await page.fill('[placeholder*="Phone"], [placeholder*="09"]', creds.phone);
  14 |   await page.fill('[type="password"]', creds.password);
  15 |   await page.click('[type="submit"]');
> 16 |   await page.waitForURL('**/dashboard**', { timeout: 10_000 });
     |              ^ TimeoutError: page.waitForURL: Timeout 10000ms exceeded.
  17 | }
  18 | 
  19 | export async function logout(page: Page) {
  20 |   await page.click('[aria-label="User menu"], button:has-text("Sign Out")');
  21 |   await page.waitForURL('**/login**');
  22 | }
  23 | 
```