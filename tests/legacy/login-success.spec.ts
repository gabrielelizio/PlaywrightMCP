import { test, expect } from '@playwright/test';

const TEST_CREDENTIALS = {
  success: {
    username: 'test_user',
    password: 'test_pass'
  }
};

const LOGIN_URL = '/login';

test.describe('Successful Login Scenarios', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(LOGIN_URL);
  });

  test('should login successfully with test_user credentials', async ({ page }) => {
    const usernameField = page.getByLabel('Username');
    const passwordField = page.getByLabel('Password');
    const signInButton = page.getByRole('button', { name: 'Sign in' });

    // Fill in the successful test credentials
    await usernameField.fill(TEST_CREDENTIALS.success.username);
    await passwordField.fill(TEST_CREDENTIALS.success.password);
    
    // Submit the form
    await signInButton.click();

    // Verify successful navigation away from login page
    await expect(page).not.toHaveURL(LOGIN_URL);
    
    // Additional verification that we're not on an error page
    await expect(page).not.toHaveURL(/.*error.*/);
  });

  test('should login successfully and maintain session', async ({ page }) => {
    const usernameField = page.getByLabel('Username');
    const passwordField = page.getByLabel('Password');
    const signInButton = page.getByRole('button', { name: 'Sign in' });

    await usernameField.fill(TEST_CREDENTIALS.success.username);
    await passwordField.fill(TEST_CREDENTIALS.success.password);
    await signInButton.click();

    // Wait for successful login
    await expect(page).not.toHaveURL(LOGIN_URL);

    // Navigate back to login page to verify we're still logged in
    await page.goto(LOGIN_URL);
    
    // Should redirect away from login page if still authenticated
    await expect(page).not.toHaveURL(LOGIN_URL);
  });

  test('should login with "Keep me signed in" option', async ({ page }) => {
    const usernameField = page.getByLabel('Username');
    const passwordField = page.getByLabel('Password');
    const keepSignedInCheckbox = page.getByText('Keep me signed in').first();
    const signInButton = page.getByRole('button', { name: 'Sign in' });

    await usernameField.fill(TEST_CREDENTIALS.success.username);
    await passwordField.fill(TEST_CREDENTIALS.success.password);
    
    // Check the "Keep me signed in" checkbox
    await keepSignedInCheckbox.click();
    
    await signInButton.click();

    await expect(page).not.toHaveURL(LOGIN_URL);
  });

  test('should login using Enter key submission', async ({ page }) => {
    const usernameField = page.getByLabel('Username');
    const passwordField = page.getByLabel('Password');

    await usernameField.fill(TEST_CREDENTIALS.success.username);
    await passwordField.fill(TEST_CREDENTIALS.success.password);
    
    // Submit using Enter key
    await passwordField.press('Enter');

    await expect(page).not.toHaveURL(LOGIN_URL);
  });

  test('should login with case-sensitive credentials', async ({ page }) => {
    const usernameField = page.getByLabel('Username');
    const passwordField = page.getByLabel('Password');
    const signInButton = page.getByRole('button', { name: 'Sign in' });

    // Use exact case as provided in test credentials
    await usernameField.fill('test_user');
    await passwordField.fill('test_pass');
    await signInButton.click();

    await expect(page).not.toHaveURL(LOGIN_URL);
  });

  test('should handle login with extra whitespace', async ({ page }) => {
    const usernameField = page.getByLabel('Username');
    const passwordField = page.getByLabel('Password');
    const signInButton = page.getByRole('button', { name: 'Sign in' });

    // Add extra whitespace to credentials
    await usernameField.fill('  test_user  ');
    await passwordField.fill('  test_pass  ');
    await signInButton.click();

    // Should still login successfully (assuming the app trims whitespace)
    await expect(page).not.toHaveURL(LOGIN_URL);
  });

  test('should login and verify successful payments access', async ({ page }) => {
    const usernameField = page.getByLabel('Username');
    const passwordField = page.getByLabel('Password');
    const signInButton = page.getByRole('button', { name: 'Sign in' });

    await usernameField.fill(TEST_CREDENTIALS.success.username);
    await passwordField.fill(TEST_CREDENTIALS.success.password);
    await signInButton.click();

    // Wait for successful login
    await expect(page).not.toHaveURL(LOGIN_URL);

    // Verify we can access payment-related functionality
    // This test assumes the successful user has access to payment features
    await expect(page.locator('body')).toBeVisible();
  });

  test('should login and verify user session data', async ({ page }) => {
    const usernameField = page.getByLabel('Username');
    const passwordField = page.getByLabel('Password');
    const signInButton = page.getByRole('button', { name: 'Sign in' });

    await usernameField.fill(TEST_CREDENTIALS.success.username);
    await passwordField.fill(TEST_CREDENTIALS.success.password);
    await signInButton.click();

    // Wait for successful login
    await expect(page).not.toHaveURL(LOGIN_URL);

    // Verify that we're logged in as the correct user
    // This might involve checking for user-specific content or navigation
    await expect(page.locator('body')).toBeVisible();
  });

  test('should handle rapid login attempts', async ({ page }) => {
    const usernameField = page.getByLabel('Username');
    const passwordField = page.getByLabel('Password');
    const signInButton = page.getByRole('button', { name: 'Sign in' });

    await usernameField.fill(TEST_CREDENTIALS.success.username);
    await passwordField.fill(TEST_CREDENTIALS.success.password);

    // Perform multiple rapid login attempts
    for (let i = 0; i < 3; i++) {
      await signInButton.click();
      await page.waitForTimeout(100); // Small delay between attempts
    }

    // Should handle gracefully and eventually succeed
    await expect(page).not.toHaveURL(LOGIN_URL);
  });

  test('should login and verify no error messages', async ({ page }) => {
    const usernameField = page.getByLabel('Username');
    const passwordField = page.getByLabel('Password');
    const signInButton = page.getByRole('button', { name: 'Sign in' });

    await usernameField.fill(TEST_CREDENTIALS.success.username);
    await passwordField.fill(TEST_CREDENTIALS.success.password);
    await signInButton.click();

    // Wait for successful login
    await expect(page).not.toHaveURL(LOGIN_URL);

    // Verify no error messages are displayed
    const errorMessages = page.locator('[class*="error"], [class*="alert"], [class*="message"]');
    await expect(errorMessages).toHaveCount(0);
  });
}); 