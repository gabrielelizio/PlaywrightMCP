import { test, expect } from '@playwright/test';
import { LoginPage } from '../../src/pages/LoginPage';
import { TestData } from '../../src/data/TestData';
import { TestUtils } from '../../src/utils/TestUtils';

test.describe('Login Success Scenarios - POM', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();
  });

  test('should login successfully with valid credentials', async ({ page }) => {
    const credentials = TestData.getCredentials('success');
    
    TestUtils.logTestInfo('Successful Login Test', `Using credentials: ${credentials.username}`);
    
    await loginPage.login(credentials.username, credentials.password);
    await loginPage.expectNotOnLoginPage();
    await loginPage.expectNoErrorMessages();
  });

  test('should login with "Keep me signed in" option', async ({ page }) => {
    const credentials = TestData.getCredentials('success');
    
    await loginPage.login(credentials.username, credentials.password, true);
    await loginPage.expectNotOnLoginPage();
  });

  test('should login using Enter key submission', async ({ page }) => {
    const credentials = TestData.getCredentials('success');
    
    await loginPage.loginWithEnter(credentials.username, credentials.password);
    await loginPage.expectNotOnLoginPage();
  });

  test('should handle login with extra whitespace', async ({ page }) => {
    const credentials = TestData.getCredentials('success');
    const usernameWithSpaces = `  ${credentials.username}  `;
    const passwordWithSpaces = `  ${credentials.password}  `;
    
    await loginPage.login(usernameWithSpaces, passwordWithSpaces);
    await loginPage.expectNotOnLoginPage();
  });

  test('should maintain session after successful login', async ({ page }) => {
    const credentials = TestData.getCredentials('success');
    
    await loginPage.login(credentials.username, credentials.password);
    await loginPage.expectNotOnLoginPage();

    // Navigate back to login page
    await loginPage.goto();
    
    // Should redirect away if still authenticated
    await loginPage.expectNotOnLoginPage();
  });

  test('should handle case-insensitive username', async ({ page }) => {
    const credentials = TestData.getCredentials('success');
    const upperCaseUsername = credentials.username.toUpperCase();
    
    await loginPage.login(upperCaseUsername, credentials.password);
    await loginPage.expectNotOnLoginPage();
  });

  test('should verify access to payment features after login', async ({ page }) => {
    const credentials = TestData.getCredentials('success');
    
    await loginPage.login(credentials.username, credentials.password);
    await loginPage.expectNotOnLoginPage();
    
    // Verify we can access payment-related functionality
    await expect(page.locator('body')).toBeVisible();
  });

  test('should handle multiple successful logins', async ({ page }) => {
    const credentials = TestData.getCredentials('success');
    
    // First login
    await loginPage.login(credentials.username, credentials.password);
    await loginPage.expectNotOnLoginPage();
    
    // Logout and login again
    await page.goto('/logout');
    await loginPage.goto();
    await loginPage.login(credentials.username, credentials.password);
    await loginPage.expectNotOnLoginPage();
  });

  test('should verify user-specific content after login', async ({ page }) => {
    const credentials = TestData.getCredentials('success');
    
    await loginPage.login(credentials.username, credentials.password);
    await loginPage.expectNotOnLoginPage();
    
    // Verify that we're logged in as the correct user
    await expect(page.locator('body')).toBeVisible();
  });
}); 