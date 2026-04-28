import { test as base, Page } from '@playwright/test';

/**
 * Global GA4 / Google Analytics / GTM request blocker.
 *
 * Import `test` from this file in every spec file — the auto fixture
 * ensures GA4 beacons and the GTM/gtag script loaders are blocked
 * before any page interaction occurs.
 *
 * WHY: Blocking GA4 during tests prevents:
 *   1. Test traffic from polluting real analytics conversion funnels
 *   2. Flaky failures caused by GA4 network requests timing out in CI
 *   3. False bounce-rate / session data appearing in production GA4
 *
 * Patterns blocked:
 *   - **googletagmanager.com**    (GTM — the primary GA4 loader)
 *   - *.google-analytics.com/*   (GA4 measurement protocol)
 *   - analytics.google.com/*     (GA4 collection endpoint)
 *   - /gtag/js*                  (gtag.js script loader)
 *   - /gtag*                     (gtag measurement calls)
 */

async function blockGA4(page: Page): Promise<void> {
  await page.route('**googletagmanager.com**', (route) => route.abort());
  await page.route('**/*.google-analytics.com/**', (route) => route.abort());
  await page.route('**/analytics.google.com/**', (route) => route.abort());
  await page.route('**/gtag/js**', (route) => route.abort());
  await page.route('**/gtag**', (route) => route.abort());
}

export { expect } from '@playwright/test';

export const test = base.extend<{ blockGA4: void }>({
  blockGA4: [
    async ({ page }, use) => {
      await blockGA4(page);
      await use();
    },
    { auto: true },
  ],
});

export { blockGA4 };
