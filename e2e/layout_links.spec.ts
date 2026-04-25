import { test, expect } from '@playwright/test';

test.describe('Layout and Links', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('Verify Hero section visibility', async ({ page }) => {
    await expect(page.locator('h1').filter({ hasText: 'Eduardo' })).toBeVisible();
    await expect(page.getByText('Most analytics teams build dashboards.')).toBeVisible();
  });

  test('Verify main navigation links scroll to correct sections', async ({ page }) => {
    // Collect specific anchor tags and check if the associated section becomes visible
    const linksToCheck = [
      { name: 'Experience', hash: '#experience' },
      { name: 'Projects', hash: '#projects' },
      { name: 'Skills', hash: '#skills' },
      { name: 'Data Viz', hash: '#viz' },
    ];

    for (const link of linksToCheck) {
      // The nav items can render as `<a>` or `<button>` depending on scroll state.
      const navItem = page.locator('nav').getByText(link.name, { exact: true }).first();
      await expect(navItem).toBeVisible();
      
      // Ensure the section exists and is visible
      const section = page.locator(`section${link.hash}, div${link.hash}`);
      await expect(section).toBeVisible();
    }
  });

  test('Verify external links have correct attributes', async ({ page }) => {
    const externalLinks = [
      { url: 'https://github.com/eduardocornelsen/' },
      { url: 'https://linkedin.com/in/eduardo-cornelsen' },
      { url: 'mailto:eduardo@eduardocornelsen.com' }
    ];

    for (const { url } of externalLinks) {
      // Find anchor tags linking to these URLs
      const link = page.locator(`a[href="${url}"]`).first();
      await expect(link).toBeVisible();

      // If it's a web link, ensure it has target="_blank"
      if (url.startsWith('http')) {
        await expect(link).toHaveAttribute('target', '_blank');
        await expect(link).toHaveAttribute('rel', 'noreferrer');
      }
    }
  });

  test('Verify Footer renders properly', async ({ page }) => {
    // Scroll to the bottom
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    
    // Check for footer branding or copyright (usually contains the name)
    await expect(page.getByText('Eduardo Cornelsen').last()).toBeVisible();
    await expect(page.locator('footer')).toBeVisible();
  });
});
