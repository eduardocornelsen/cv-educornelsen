import { test as base, Page } from '@playwright/test';

/**
 * Global GA4 / Google Analytics request blocker.
 *
 * All tests that import `test` from this file instead of '@playwright/test'
 * will automatically have GA4 beacons and the gtag script loader blocked
 * before any page interaction occurs.
 *
 * WHY: Blocking GA4 during tests prevents:
 *   1. Test traffic from polluting real analytics conversion funnels
 *   2. Flaky failures caused by GA4 network requests timing out in CI
 *   3. False bounce-rate / session data appearing in production GA4
 *
 * Patterns blocked:
 *   - *.google-analytics.com/*   (GA4 measurement protocol)
 *   - analytics.google.com/*     (GA4 collection endpoint)
 *   - /gtag/js*                  (gtag.js script loader)
 *   - /gtag*                     (gtag measurement calls)
 */

async function blockGA4(page: Page): Promise<void> {
  await page.route('**/*.google-analytics.com/**', (route) => route.abort());
  await page.route('**/analytics.google.com/**', (route) => route.abort());
  await page.route('**/gtag/js**', (route) => route.abort());
  await page.route('**/gtag**', (route) => route.abort());
}

// Re-export everything from the base test so callers get the full API.
export { expect } from '@playwright/test';

/**
 * Extended test object with GA4 blocking applied automatically.
 * Use `import { test } from '../e2e/fixtures'` in any spec that should
 * have analytics blocked — or apply blockGA4() manually if you need to
 * mix blocked/unblocked contexts in the same spec.
 */
export const test = base.extend<{ blockGA4: void }>({
  blockGA4: [
    async ({ page }, use) => {
      await blockGA4(page);
      await use();
    },
    { auto: true }, // runs automatically for every test that uses this fixture
  ],
});

export { blockGA4 };
