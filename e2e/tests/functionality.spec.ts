import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/HomePage';

test.describe('Core Functionality & Navigation', () => {
  const routes = ['/home', '/notes', '/today', '/projects', '/vault', '/you'];
  
  for (const route of routes) {
    test(`should load ${route} without crashing`, async ({ page }) => {
      await page.goto(route, { waitUntil: 'domcontentloaded' });
      // Give Next.js a moment to mount the React tree
      await page.waitForTimeout(1500); 
      await expect(page.locator('body')).toBeVisible();
    });
  }

  test.describe('Wellbeing Tools', () => {
    test('should submit a rant', async ({ page }) => {
      await page.goto('/you', { waitUntil: 'domcontentloaded' });
      
      // Click the tab
      await page.getByRole('button', { name: /^Rant$/i }).click();
      
      // Use placeholder which is visible to the user
      const textarea = page.getByPlaceholder(/What is frustrating you right now/i);
      await textarea.fill('Testing rant functionality!');
      
      // Submit
      await page.getByRole('button', { name: /Let it out/i }).click();
      
      // Wait for the AI response
      await expect(page.getByText(/Scout/i).first()).toBeVisible({ timeout: 15000 });
    });
  });

  test.describe('Notes', () => {
    test('should open capture modal', async ({ page }) => {
      await page.goto('/notes', { waitUntil: 'domcontentloaded' });
      
      // Target the button by its role and text
      await page.getByRole('button', { name: /Capture/i }).first().click();
      
      // Wait for modal title
      await expect(page.getByText(/Capture anything/i)).toBeVisible({ timeout: 5000 });
    });
  });
});
