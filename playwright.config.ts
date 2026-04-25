import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E configuration.
 *
 * Run:  npx playwright test
 * UI:   npx playwright test --ui
 * Debug: npx playwright test --debug
 *
 * The tests expect either:
 *   - A local dev server (`npm run dev`) running on port 5173, OR
 *   - A production build served on port 8080 (`npm run build && npm start`)
 *
 * Set the E2E_BASE_URL env var to override the default.
 *
 * GA4 / Google Analytics blocking:
 *   All GA4 beacons and the gtag script loader are intercepted and aborted
 *   for every test via a shared route fixture in e2e/fixtures.ts. This prevents
 *   test traffic from polluting real analytics data and removes beacon latency.
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: false, // run sequentially — Plotly CDN tests share state
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: [['list'], ['html', { outputFolder: 'playwright-report', open: 'never' }]],

  use: {
    baseURL: process.env.E2E_BASE_URL ?? 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    // Allow CDN requests — real network is needed for cdn.plot.ly
    ignoreHTTPSErrors: false,
  },

  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        launchOptions: {
          executablePath:
            process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH ??
            `${process.env.HOME}/.cache/ms-playwright/chromium-1217/chrome-linux64/chrome`,
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-gpu',
            '--disable-dev-shm-usage',
          ],
        },
      },
    },
  ],

  // Auto-start vite dev server if not already running
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: true,
    timeout: 30_000,
  },
});
