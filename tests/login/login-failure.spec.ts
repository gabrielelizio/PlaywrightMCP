import { test, expect } from '@playwright/test';
import { LoginPage } from '../../src/pages/LoginPage';
import { TestData } from '../../src/data/TestData';
import { TestUtils } from '../../src/utils/TestUtils';

test.describe('Login Failure Scenarios - POM', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();
  });

  test('should fail with test_failure credentials', async ({ page }) => {
    const credentials = TestData.getCredentials('failure');
    
    TestUtils.logTestInfo('Failed Login Test', `Using credentials: ${credentials.username}`);
    
    await loginPage.login(credentials.username, credentials.password);
    await loginPage.expectStillOnLoginPage();
    await loginPage.expectErrorMessage();
  });

  test('should fail with invalid credentials', async ({ page }) => {
    const credentials = TestData.getCredentials('invalid');
    
    await loginPage.login(credentials.username, credentials.password);
    await loginPage.expectStillOnLoginPage();
    await loginPage.expectErrorMessage();
  });

  test('should fail with empty fields', async ({ page }) => {
    await loginPage.signInButton.click();
    await loginPage.expectStillOnLoginPage();
  });

  test('should fail with only username', async ({ page }) => {
    const credentials = TestData.getCredentials('success');
    
    await loginPage.usernameField.fill(credentials.username);
    await loginPage.signInButton.click();
    await loginPage.expectStillOnLoginPage();
  });

  test('should fail with only password', async ({ page }) => {
    const credentials = TestData.getCredentials('success');
    
    await loginPage.passwordField.fill(credentials.password);
    await loginPage.signInButton.click();
    await loginPage.expectStillOnLoginPage();
  });

  test('should fail with wrong case password', async ({ page }) => {
    const credentials = TestData.getCredentials('success');
    const wrongCasePassword = credentials.password.toUpperCase();
    
    await loginPage.login(credentials.username, wrongCasePassword);
    await loginPage.expectStillOnLoginPage();
    await loginPage.expectErrorMessage();
  });

  test('should fail with SQL injection attempts', async ({ page }) => {
    const sqlInjectionPayloads = TestData.getSQLInjectionPayloads();
    
    for (const payload of sqlInjectionPayloads.slice(0, 3)) {
      TestUtils.logTestInfo('SQL Injection Test', `Testing payload: ${payload.name}`);
      
      await loginPage.login(payload.payload, payload.payload);
      await loginPage.expectStillOnLoginPage();
    }
  });

  test('should fail with XSS attempts', async ({ page }) => {
    const xssPayloads = TestData.getXSSPayloads();
    
    for (const payload of xssPayloads.slice(0, 3)) {
      TestUtils.logTestInfo('XSS Test', `Testing payload: ${payload.name}`);
      
      await loginPage.login(payload.payload, payload.payload);
      await loginPage.expectStillOnLoginPage();
    }
  });

  test('should fail with very long credentials', async ({ page }) => {
    const longUsername = 'a'.repeat(1000);
    const longPassword = 'b'.repeat(1000);
    
    await loginPage.login(longUsername, longPassword);
    await loginPage.expectStillOnLoginPage();
  });

  test('should fail with special characters', async ({ page }) => {
    const specialChars = ['!@#$%^&*()', 'áéíóú', '测试', '🎉🎊'];
    
    for (const chars of specialChars) {
      await loginPage.login(chars, chars);
      await loginPage.expectStillOnLoginPage();
    }
  });

  test('should fail with null/undefined values', async ({ page }) => {
    await loginPage.login('', '');
    await loginPage.expectStillOnLoginPage();
  });

  test('should fail with whitespace-only credentials', async ({ page }) => {
    await loginPage.login('   ', '   ');
    await loginPage.expectStillOnLoginPage();
  });

  test('should fail with numeric credentials', async ({ page }) => {
    await loginPage.login('12345', '67890');
    await loginPage.expectStillOnLoginPage();
  });

  test('should fail with email format username', async ({ page }) => {
    await loginPage.login('test@example.com', 'password');
    await loginPage.expectStillOnLoginPage();
  });

  test('should fail with very short credentials', async ({ page }) => {
    await loginPage.login('a', 'b');
    await loginPage.expectStillOnLoginPage();
  });

  test('should fail with mixed case credentials', async ({ page }) => {
    await loginPage.login('Test_User', 'Test_Pass');
    await loginPage.expectStillOnLoginPage();
  });

  test('should fail with credentials containing spaces', async ({ page }) => {
    await loginPage.login('test user', 'test pass');
    await loginPage.expectStillOnLoginPage();
  });
}); 