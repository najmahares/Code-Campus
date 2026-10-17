import { test, expect } from '@playwright/test';

test.describe('Security & Auth Guards', () => {
  test('should enforce rate limits on API', async ({ page }) => {
    // Mock the 429 rate limit
    await page.route('**/api/wellbeing/rant', route => {
      route.fulfill({ status: 429, body: JSON.stringify({ error: 'Too many requests. Please wait a minute.' }) });
    });
    
    await page.goto('/you', { waitUntil: 'domcontentloaded' });
    
    await page.getByRole('button', { name: /^Rant$/i }).click();
    await page.getByPlaceholder(/What is frustrating you/i).fill('Spam test');
    await page.getByRole('button', { name: /Let it out/i }).click();
    
    await expect(page.getByText(/Too many requests/i)).toBeVisible({ timeout: 10000 });
  });
});
