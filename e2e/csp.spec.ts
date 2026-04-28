import { test, expect } from './fixtures';

/**
 * CSP (Content-Security-Policy) Regression Tests
 *
 * These tests catch the exact bug that broke the Plotly charts:
 * the CSP script-src was missing cdn.plot.ly, silently blocking
 * the Plotly script and causing an infinite spinner.
 *
 * These tests run against the DEV server (port 5173).
 * Note: the dev server does NOT serve the production CSP header from server/index.js —
 * that lives in the Express layer. For full CSP testing against production headers,
 * set E2E_BASE_URL=http://localhost:8080 and run against the production build.
 *
 * What these tests DO catch regardless:
 *   - Browser-level CSP violations logged to console
 *   - Network requests to cdn.plot.ly succeeding (CDN is reachable)
 *   - window.Plotly being defined after the charts load
 */

// Analytics platforms (GTM/GA4/doubleclick) intentionally loaded on production
// inject inline event handlers and connect to doubleclick.net. These are
// known violations that don't break the app; they're fixed in server/index.js
// but only take effect after a production deployment.
const ANALYTICS_PATTERNS = [
  'doubleclick.net',
  'script-src-attr',
  'inline event handler',
  'googletagmanager.com',
  'google-analytics.com',
];
const isAnalyticsViolation = (msg: string) =>
  ANALYTICS_PATTERNS.some(p => msg.includes(p));

test.describe('CSP & Plotly CDN health', () => {
  // Allow extra time for slow CI runners
  test.setTimeout(60_000);

  // ─────────────────────────────────────────────────────────────────────────
  // 1. No CSP violations in browser console on page load
  // ─────────────────────────────────────────────────────────────────────────
  test('No Content-Security-Policy violations on page load', async ({ page }) => {
    const cspViolations: string[] = [];

    // Capture all console errors — CSP violations appear as console errors
    page.on('console', msg => {
      if (
        msg.type() === 'error' &&
        (msg.text().includes('Content Security Policy') ||
          msg.text().includes('CSP') ||
          msg.text().includes('content-security-policy')) &&
        !isAnalyticsViolation(msg.text())
      ) {
        cspViolations.push(msg.text());
      }
    });

    // Also capture securitypolicyviolation events via JS injection
    await page.addInitScript(() => {
      const ANALYTICS = ['doubleclick.net', 'googletagmanager.com', 'google-analytics.com'];
      document.addEventListener('securitypolicyviolation', (e: SecurityPolicyViolationEvent) => {
        const isAnalytics =
          ANALYTICS.some(d => e.blockedURI.includes(d)) ||
          e.violatedDirective === 'script-src-attr';
        if (!isAnalytics) {
          console.error(`[CSP VIOLATION] blocked-uri: ${e.blockedURI} | violated-directive: ${e.violatedDirective}`);
        }
      });
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    expect(cspViolations, `CSP violations detected:\n${cspViolations.join('\n')}`).toHaveLength(0);
  });

  // ─────────────────────────────────────────────────────────────────────────
  // 2. No CSP violations when navigating to Predictive Models tab
  // ─────────────────────────────────────────────────────────────────────────
  test('No CSP violations when Plotly surface loads', async ({ page }) => {
    const cspViolations: string[] = [];

    page.on('console', msg => {
      if (
        msg.type() === 'error' &&
        msg.text().toLowerCase().includes('content security policy') &&
        !isAnalyticsViolation(msg.text())
      ) {
        cspViolations.push(msg.text());
      }
    });

    await page.addInitScript(() => {
      const ANALYTICS = ['doubleclick.net', 'googletagmanager.com', 'google-analytics.com'];
      document.addEventListener('securitypolicyviolation', (e: SecurityPolicyViolationEvent) => {
        const isAnalytics =
          ANALYTICS.some(d => e.blockedURI.includes(d)) ||
          e.violatedDirective === 'script-src-attr';
        if (!isAnalytics) {
          console.error(`[CSP VIOLATION] blocked-uri: ${e.blockedURI} | directive: ${e.violatedDirective}`);
        }
      });
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Click Predictive Models tab to trigger Plotly CDN load
    await page.getByRole('button', { name: /predictive models/i }).click();
    
    // Wait for Plotly instead of static sleep
    await page.waitForFunction(() => typeof (window as any).Plotly !== 'undefined', { timeout: 15_000 }).catch(() => {});

    expect(cspViolations, `CSP violations on Predictive Models tab:\n${cspViolations.join('\n')}`).toHaveLength(0);
  });

  // ─────────────────────────────────────────────────────────────────────────
  // 3. cdn.plot.ly network request returns 200 (CDN is reachable)
  // ─────────────────────────────────────────────────────────────────────────
  test('Plotly CDN script request returns HTTP 200', async ({ page }) => {
    let plotlyStatus: number | null = null;

    page.on('response', response => {
      if (response.url().includes('cdn.plot.ly')) {
        plotlyStatus = response.status();
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Trigger Plotly load
    await page.getByRole('button', { name: /predictive models/i }).click();
    await page.waitForFunction(() => typeof (window as any).Plotly !== 'undefined', { timeout: 15_000 }).catch(() => {});

    expect(plotlyStatus, 'Plotly CDN request was never made — script injection may be failing').not.toBeNull();
    expect(plotlyStatus).toBe(200);
  });

  // ─────────────────────────────────────────────────────────────────────────
  // 4. window.Plotly is defined after loading Predictive Models tab
  //    This is the canonical regression test for the CSP bug
  // ─────────────────────────────────────────────────────────────────────────
  test('window.Plotly is defined after Predictive Models tab loads', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await page.getByRole('button', { name: /predictive models/i }).click();

    // Poll until Plotly is defined (max 15s)
    await page.waitForFunction(
      () => typeof (window as any).Plotly !== 'undefined',
      { timeout: 15_000 }
    );

    const plotlyDefined = await page.evaluate(() => typeof (window as any).Plotly !== 'undefined');
    expect(plotlyDefined).toBe(true);
  });

  // ─────────────────────────────────────────────────────────────────────────
  // 5. window.Plotly is defined after loading Revenue Flow tab
  // ─────────────────────────────────────────────────────────────────────────
  test('window.Plotly is defined after Revenue Flow tab loads', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await page.getByRole('button', { name: /revenue flow/i }).click();

    await page.waitForFunction(
      () => typeof (window as any).Plotly !== 'undefined',
      { timeout: 15_000 }
    );

    const plotlyDefined = await page.evaluate(() => typeof (window as any).Plotly !== 'undefined');
    expect(plotlyDefined).toBe(true);
  });

  // ─────────────────────────────────────────────────────────────────────────
  // 6. Error fallback is NOT shown when CDN loads correctly
  // ─────────────────────────────────────────────────────────────────────────
  test('CSP error fallback is not shown when Plotly loads successfully', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check Predictive Models
    await page.getByRole('button', { name: /predictive models/i }).click();
    await page.waitForFunction(() => typeof (window as any).Plotly !== 'undefined', { timeout: 15_000 }).catch(() => {});
    await expect(page.getByText('3D surface could not load')).toBeHidden();
    await expect(page.getByText('Plotly CDN script was blocked')).toBeHidden();

    // Check Revenue Flow
    await page.getByRole('button', { name: /revenue flow/i }).click();
    await page.waitForFunction(() => typeof (window as any).Plotly !== 'undefined', { timeout: 5_000 }).catch(() => {});
    await expect(page.getByText('Flow diagram could not load')).toBeHidden();
  });
});
