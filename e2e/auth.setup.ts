import { test as setup, expect } from '@playwright/test';
import path from 'path';

const authFile = path.join(__dirname, '.auth/user.json');
const TEST_EMAIL = 'test@gmail.com';
const TEST_PASSWORD = 'TestPass#123';

setup('authenticate', async ({ page }) => {
  console.log(`Navigating to /login...`);
  await page.goto('/login');
  await page.waitForLoadState('networkidle');
  
  console.log(`Filling credentials for ${TEST_EMAIL}...`);
  await page.locator('input[type="email"]').fill(TEST_EMAIL);
  await page.locator('input[type="password"]').fill(TEST_PASSWORD);
  
  console.log(`Clicking submit...`);
  await page.locator('button[type="submit"]').click();

  try {
    console.log(`Waiting for redirect to /home...`);
    await page.waitForURL('/home', { timeout: 15000 });
    
    console.log(`Injecting onboarding bypass...`);
    await page.evaluate(() => {
      localStorage.setItem('codecampus_onboarded', 'true');
    });

    console.log(`Verifying dashboard greeting...`);
    await expect(page.getByRole('heading', { name: /Good (morning|afternoon|evening)/i })).toBeVisible();
    
    await page.context().storageState({ path: authFile });
    console.log(`✓ Auth state saved successfully!`);
  } catch (error) {
    console.error(`❌ Failed to login. Current URL is: ${page.url()}`);
    // Take a screenshot of the failure so you can see it in the test results
    await page.screenshot({ path: 'login-failure.png', fullPage: true });
    throw error;
  }
});
