import { test, expect } from '@playwright/test';

test.describe('API Resilience & Error Handling', () => {
  test('should show a toast if Rant API fails', async ({ page }) => {
    // Mock the 500 error
    await page.route('**/api/wellbeing/rant', route => {
      route.fulfill({ status: 500, body: JSON.stringify({ error: 'Server Error' }) });
    });

    await page.goto('/you', { waitUntil: 'domcontentloaded' });
    
    await page.getByRole('button', { name: /^Rant$/i }).click();
    await page.getByPlaceholder(/What is frustrating you/i).fill('Test error handling');
    await page.getByRole('button', { name: /Let it out/i }).click();

    await expect(page.getByText(/Server Error/i)).toBeVisible({ timeout: 10000 });
  });
});
