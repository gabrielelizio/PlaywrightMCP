import { test, expect } from '@playwright/test';
import { LoginPage } from '../../src/pages/LoginPage';
import { TestData } from '../../src/data/TestData';

test.describe('Basic Login Test', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
  });

  test('should load login page correctly', async ({ page }) => {
    await loginPage.goto();
    await loginPage.expectPageLoaded();
    await loginPage.expectFormElementsVisible();
  });

  test('should display test credentials', async ({ page }) => {
    await loginPage.goto();
    await loginPage.expectTestCredentialsVisible();
  });

  test('should fill form fields', async ({ page }) => {
    await loginPage.goto();
    
    await loginPage.usernameField.fill('test_user');
    await loginPage.passwordField.fill('test_pass');
    
    await expect(loginPage.usernameField).toHaveValue('test_user');
    await expect(loginPage.passwordField).toHaveValue('test_pass');
  });

  test('should click sign in button', async ({ page }) => {
    await loginPage.goto();
    
    // Fill form
    await loginPage.usernameField.fill('test_user');
    await loginPage.passwordField.fill('test_pass');
    
    // Click sign in
    await loginPage.signInButton.click();
    
    // Should either redirect or show error
    await page.waitForLoadState('networkidle');
    
    // Check if we're still on login page (which is expected for invalid credentials)
    const currentUrl = page.url();
    expect(currentUrl).toContain('/login');
  });

  test('should handle invalid credentials gracefully', async ({ page }) => {
    await loginPage.goto();
    
    // Fill form with invalid credentials
    await loginPage.usernameField.fill('invalid_user');
    await loginPage.passwordField.fill('invalid_pass');
    
    // Click sign in
    await loginPage.signInButton.click();
    
    // Should stay on login page
    await page.waitForLoadState('networkidle');
    const currentUrl = page.url();
    expect(currentUrl).toContain('/login');
  });

  test('should test form validation', async ({ page }) => {
    await loginPage.goto();
    
    // Try to submit empty form
    await loginPage.signInButton.click();
    
    // Should stay on login page
    await page.waitForLoadState('networkidle');
    const currentUrl = page.url();
    expect(currentUrl).toContain('/login');
  });
}); 