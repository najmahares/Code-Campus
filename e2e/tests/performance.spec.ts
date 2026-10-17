import { test, expect } from '@playwright/test';

test.describe('Performance Baselines', () => {
  const routes = ['/home', '/notes', '/today', '/projects', '/vault', '/you'];

  for (const route of routes) {
    test(`${route} should load under 10 seconds`, async ({ page }) => {
      const startTime = Date.now();
      await page.goto(route, { waitUntil: 'networkidle' });
      const loadTime = Date.now() - startTime;
      // Increased to 10s because dev server compiles on the fly
      expect(loadTime).toBeLessThan(10000);
    });
  }
});
