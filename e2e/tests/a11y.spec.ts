import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility Audits', () => {
  const routes = ['/home', '/notes', '/today', '/projects', '/vault', '/you'];
  
  for (const route of routes) {
    test(`${route} should pass structural A11y standards`, async ({ page }) => {
      await page.goto(route, { waitUntil: 'networkidle' });
      // Wait extra time for animations and hydration to complete
      await page.waitForTimeout(2500); 
      
      const results = await new AxeBuilder({ page })
        .exclude('iframe')
        .exclude('svg')
        .disableRules([
          'color-contrast',
          'landmark-unique',
          'aria-allowed-attr',
          'button-name',
          'link-name'
        ])
        .withTags(['wcag2a', 'wcag2aa'])
        .analyze();

      // If it fails, print exactly what is wrong
      if (results.violations.length > 0) {
        console.log(`--- A11y Violations on ${route} ---`);
        console.log(JSON.stringify(results.violations.map(v => ({ id: v.id, impact: v.impact, nodes: v.nodes.length })), null, 2));
      }

      expect(results.violations).toEqual([]);
    });
  }
});
