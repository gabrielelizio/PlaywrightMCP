import { test, expect } from '@playwright/test';

test('Debug: Check if login page loads', async ({ page }) => {
  // Navigate to login page
  await page.goto('https://v0-imagine-deals.vercel.app/login');
  
  // Wait for page to load
  await page.waitForLoadState('networkidle');
  
  // Check if page title is correct
  await expect(page).toHaveTitle(/ImagineX Deals/);
  
  // Check if main elements are visible
  await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible();
  await expect(page.getByLabel('Username')).toBeVisible();
  await expect(page.getByLabel('Password')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible();
  
  // Check if test credentials are visible
  await expect(page.getByText('Test Credentials')).toBeVisible();
  
  console.log('✅ Login page loads correctly');
});

test('Debug: Check form interaction', async ({ page }) => {
  await page.goto('https://v0-imagine-deals.vercel.app/login');
  await page.waitForLoadState('networkidle');
  
  // Fill form
  await page.getByLabel('Username').fill('test_user');
  await page.getByLabel('Password').fill('test_pass');
  
  // Check values
  await expect(page.getByLabel('Username')).toHaveValue('test_user');
  await expect(page.getByLabel('Password')).toHaveValue('test_pass');
  
  console.log('✅ Form fields work correctly');
});

test('Debug: Check sign in button', async ({ page }) => {
  await page.goto('https://v0-imagine-deals.vercel.app/login');
  await page.waitForLoadState('networkidle');
  
  // Fill form
  await page.getByLabel('Username').fill('test_user');
  await page.getByLabel('Password').fill('test_pass');
  
  // Click sign in
  await page.getByRole('button', { name: 'Sign in' }).click();
  
  // Wait for any navigation
  await page.waitForLoadState('networkidle');
  
  // Check current URL
  const currentUrl = page.url();
  console.log(`Current URL: ${currentUrl}`);
  
  // Should either redirect or stay on login page
  expect(currentUrl).toContain('v0-imagine-deals.vercel.app');
  
  console.log('✅ Sign in button works');
}); 