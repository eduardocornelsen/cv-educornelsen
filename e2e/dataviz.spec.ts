import { test, expect } from './fixtures';
import type { Page } from '@playwright/test';

/**
 * DataViz E2E Tests — "See What's Possible" section
 *
 * These tests verify that all 6 DataViz tabs render their content correctly,
 * with special focus on the Plotly-powered charts (Predictive Models and Revenue Flow)
 * that were previously broken by the CSP blocking cdn.plot.ly.
 */

const DATAVIZ_SECTION = '#dataviz, section:has-text("See What\'s Possible")';
const PLOTLY_TIMEOUT = 15_000; // Plotly CDN can take a few seconds

/** Navigate to the DataViz section by clicking the nav link */
async function goToDataViz(page: Page) {
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  // Click the "Data Viz" nav button
  const navBtn = page.getByRole('button', { name: /data viz/i }).first();
  if (await navBtn.isVisible()) {
    await navBtn.click();
  }
  // Scroll the section into view as a fallback
  await page.evaluate(() => {
    const el = document.querySelector('section');
    const dataviz = Array.from(document.querySelectorAll('section')).find(s =>
      s.textContent?.includes("See What's Possible")
    );
    dataviz?.scrollIntoView({ behavior: 'instant' });
  });
  await page.waitForTimeout(400);
}

/** Click a DataViz tab by its visible label */
async function clickTab(page: Page, label: string) {
  await page.getByRole('button', { name: new RegExp(label, 'i') }).click();
  await page.waitForTimeout(400); // allow AnimatePresence to settle
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. Page loads and section is visible
// ─────────────────────────────────────────────────────────────────────────────
test('DataViz section renders with "See What\'s Possible" heading', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  const heading = page.getByRole('heading', { name: /see what's possible/i });
  await expect(heading).toBeVisible({ timeout: 10_000 });
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. All 6 tabs are present
// ─────────────────────────────────────────────────────────────────────────────
test('DataViz shows all 6 tabs', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  const tabs = ['Live Dashboard', 'Network Graph', 'Predictive Models', 'Advanced Table', 'Real-Time Stream', 'Revenue Flow'];
  for (const tab of tabs) {
    await expect(page.getByRole('button', { name: new RegExp(tab, 'i') })).toBeVisible({ timeout: 8_000 });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. Live Dashboard tab renders KPI cards and charts
// ─────────────────────────────────────────────────────────────────────────────
test('Live Dashboard tab: KPI cards and revenue chart are visible', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  // Dashboard is the default tab
  await expect(page.getByText('Avg Deal Value')).toBeVisible({ timeout: 8_000 });
  await expect(page.getByText('Win Rate')).toBeVisible();
  // Recharts renders an SVG
  await expect(page.locator('svg').first()).toBeVisible();
});

// ─────────────────────────────────────────────────────────────────────────────
// 4. Network Graph tab renders D3 force graph
// ─────────────────────────────────────────────────────────────────────────────
test('Network Graph tab: D3 force graph SVG renders', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  await clickTab(page, 'Network Graph');

  // The D3 SVG containing labelled nodes
  await expect(page.getByText('Data Lake')).toBeVisible({ timeout: 8_000 });
  await expect(page.locator('svg text').filter({ hasText: /^ML Engine$/ })).toBeVisible();
  // D3 SVG exists inside the network container
  const networkSvg = page.locator('svg').nth(1);
  await expect(networkSvg).toBeVisible();
});

// ─────────────────────────────────────────────────────────────────────────────
// 5. ✨ CRITICAL: Predictive Models — Plotly 3D surface renders
// ─────────────────────────────────────────────────────────────────────────────
test('Predictive Models tab: Plotly 3D surface renders (no infinite spinner)', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  await clickTab(page, 'Predictive Models');

  // The loading text should appear initially…
  const loadingText = page.getByText('Loading 3D surface...');

  // …and then DISAPPEAR once Plotly renders (this is the key regression test)
  await expect(loadingText).toBeHidden({ timeout: PLOTLY_TIMEOUT });

  // Plotly creates a .js-plotly-plot container
  const plotlyContainer = page.locator('.js-plotly-plot').first();
  await expect(plotlyContainer).toBeVisible({ timeout: PLOTLY_TIMEOUT });

  // window.Plotly must be defined (CDN script was not blocked)
  const plotlyDefined = await page.evaluate(() => typeof (window as any).Plotly !== 'undefined');
  expect(plotlyDefined).toBe(true);

  // The error fallback must NOT be showing
  await expect(page.getByText('3D surface could not load')).toBeHidden();
});

// ─────────────────────────────────────────────────────────────────────────────
// 6. ✨ CRITICAL: Revenue Flow — Plotly Sankey renders
// ─────────────────────────────────────────────────────────────────────────────
test('Revenue Flow tab: Plotly Sankey diagram renders (no infinite spinner)', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  await clickTab(page, 'Revenue Flow');

  // Loading spinner text should disappear once Plotly renders
  const spinnerText = page.getByText('Building flow diagram...');
  await expect(spinnerText).toBeHidden({ timeout: PLOTLY_TIMEOUT });

  // Plotly Sankey creates a .js-plotly-plot container
  const plotlyContainer = page.locator('.js-plotly-plot').first();
  await expect(plotlyContainer).toBeVisible({ timeout: PLOTLY_TIMEOUT });

  // The sidebar info should be visible (use the div heading, not the tab button)
  await expect(page.locator('div').filter({ hasText: /^Revenue Flow$/ }).first()).toBeVisible();
  await expect(page.getByText('CRM, Marketing, Ops')).toBeVisible();

  // Error fallback must NOT be showing
  await expect(page.getByText('Flow diagram could not load')).toBeHidden();
});

// ─────────────────────────────────────────────────────────────────────────────
// 7. Advanced Table tab renders sortable table
// ─────────────────────────────────────────────────────────────────────────────
test('Advanced Table tab: table rows and heatmap cells render', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  await clickTab(page, 'Advanced Table');

  await expect(page.getByText('Revenue Intelligence Table')).toBeVisible({ timeout: 8_000 });
  // Region data
  await expect(page.getByRole('cell', { name: 'Brazil' })).toBeVisible();
  // YoY column
  await expect(page.getByText(/\+\d+\.\d+%/).first()).toBeVisible();
});

// ─────────────────────────────────────────────────────────────────────────────
// 8. Real-Time Stream tab shows live data
// ─────────────────────────────────────────────────────────────────────────────
test('Real-Time Stream tab: live metric cards render', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  await clickTab(page, 'Real-Time Stream');

  await expect(page.getByText('Revenue Index', { exact: true }).first()).toBeVisible({ timeout: 8_000 });
  await expect(page.getByText('Anomaly Score', { exact: true }).first()).toBeVisible();
  await expect(page.getByText('Inference ms', { exact: true }).first()).toBeVisible();
  // The live badge
  await expect(page.getByText(/live.*400ms/i)).toBeVisible();
});

// ─────────────────────────────────────────────────────────────────────────────
// 9. Tab switching does not crash (smoke test for all tabs in sequence)
// ─────────────────────────────────────────────────────────────────────────────
test('Switching through all tabs does not throw JS errors', async ({ page }) => {
  const jsErrors: string[] = [];
  page.on('pageerror', err => jsErrors.push(err.message));

  await page.goto('/');
  await page.waitForLoadState('networkidle');

  const tabs = ['Network Graph', 'Predictive Models', 'Advanced Table', 'Real-Time Stream', 'Revenue Flow', 'Live Dashboard'];
  for (const tab of tabs) {
    await clickTab(page, tab);
  }

  // Filter out known non-critical warnings (e.g. React DevTools)
  const criticalErrors = jsErrors.filter(e =>
    !e.includes('Download the React DevTools') &&
    !e.includes('Warning:')
  );
  expect(criticalErrors).toHaveLength(0);
});
