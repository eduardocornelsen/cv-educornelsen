import { test, expect } from './fixtures';

test.describe('DashboardShowcase component', () => {

  test.beforeEach(async ({ page }) => {
    // Navigate to the app before each test
    await page.goto('/');
    // Scroll to the data viz section
    const vizSection = page.locator('#viz');
    await vizSection.scrollIntoViewIfNeeded();
  });

  test('Render Dashboard container and headings', async ({ page }) => {
    // These match the props passed in PortfolioEduardo.tsx
    await expect(page.getByText('Live BI & Strategic Reporting')).toBeVisible();
    await expect(page.getByText('Analytics Command Centers for')).toBeVisible();
  });

  test('Render all 5 dashboard tabs', async ({ page }) => {
    // Define the expected tabs
    const tabs = [
      'Revenue Ops',
      'SaaS Metrics',
      'DTC Growth',
      'E-Commerce',
      'GTM & Pipeline'
    ];

    for (const tab of tabs) {
      const tabButton = page.getByRole('button', { name: tab }).first();
      await expect(tabButton).toBeVisible();
    }
  });

  test('Verify tab switching changes metrics', async ({ page }) => {
    // Initially on "Revenue Ops", check for specific metric
    await expect(page.getByText('Total MRR')).toBeVisible();
    await expect(page.locator('div.text-3xl').filter({ hasText: /^\$1\.24M$/ })).toBeVisible();

    // Switch to "SaaS Metrics"
    await page.getByRole('button', { name: 'SaaS Metrics' }).first().click();
    await expect(page.getByText('Active Users', { exact: true })).toBeVisible();
    await expect(page.getByText('84.2k')).toBeVisible();

    // Switch to E-Commerce
    await page.getByRole('button', { name: 'E-Commerce' }).first().click();
    await expect(page.getByText('Gross Merchandise')).toBeVisible();
    await expect(page.locator('div.text-3xl').filter({ hasText: /^\$4\.8M$/ })).toBeVisible();
  });

  test('Verify Recharts Area Chart renders without errors', async ({ page }) => {
    // Ensure the chart container is present
    const chartContainer = page.locator('.recharts-responsive-container').first();
    await expect(chartContainer).toBeVisible();

    // Ensure the paths inside the SVG are rendered
    const areaPath = page.locator('.recharts-area-area').first();
    await expect(areaPath).toBeVisible();
  });

  test('Verify "Automated Actions" activity feed is visible', async ({ page }) => {
    await expect(page.getByText('Automated Actions')).toBeVisible();
    await expect(page.getByText('Slack alert triggered: High Value Lead')).toBeVisible();
  });

});
