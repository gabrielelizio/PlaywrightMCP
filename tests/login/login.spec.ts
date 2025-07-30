import { test, expect } from '@playwright/test';
import { LoginPage } from '../../src/pages/LoginPage';
import { TestData } from '../../src/data/TestData';
import { TestUtils } from '../../src/utils/TestUtils';

test.describe('Login Page - POM Architecture', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();
  });

  test.describe('Page Structure and Elements', () => {
    test('should display login page with all required elements', async ({ page }) => {
      await loginPage.expectPageLoaded();
      await loginPage.expectFormElementsVisible();
      await loginPage.expectPasswordFieldMasked();
      await loginPage.expectTestCredentialsVisible();
    });

    test('should have proper accessibility features', async ({ page }) => {
      await TestUtils.performAccessibilityChecks(page);
      await loginPage.expectTabOrder();
    });
  });

  test.describe('Successful Login Scenarios', () => {
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
  });

  test.describe('Failed Login Scenarios', () => {
    test('should fail with invalid credentials', async ({ page }) => {
      const credentials = TestData.getCredentials('invalid');
      
      await loginPage.login(credentials.username, credentials.password);
      await loginPage.expectStillOnLoginPage();
    });

    test('should fail with test_failure credentials', async ({ page }) => {
      const credentials = TestData.getCredentials('failure');
      
      await loginPage.login(credentials.username, credentials.password);
      await loginPage.expectStillOnLoginPage();
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
  });

  test.describe('Security Testing', () => {
    test('should prevent SQL injection attacks', async ({ page }) => {
      const sqlPayloads = TestData.getSqlInjectionPayloads();
      
      for (const payload of sqlPayloads) {
        TestUtils.logTestInfo('SQL Injection Test', `Testing: ${payload.name}`);
        
        await loginPage.fillMaliciousInput(payload.payload);
        await loginPage.signInButton.click();
        
        await loginPage.expectStillOnLoginPage();
        await TestUtils.checkSecurityVulnerabilities(page);
      }
    });

    test('should prevent XSS attacks', async ({ page }) => {
      const xssPayloads = TestData.getXssPayloads();
      
      for (const payload of xssPayloads) {
        TestUtils.logTestInfo('XSS Test', `Testing: ${payload.name}`);
        
        await loginPage.fillMaliciousInput(payload.payload);
        await loginPage.signInButton.click();
        
        await loginPage.expectStillOnLoginPage();
        await TestUtils.checkSecurityVulnerabilities(page);
      }
    });

    test('should handle special characters', async ({ page }) => {
      const specialChars = TestData.SPECIAL_CHARACTERS;
      
      for (const [name, payload] of Object.entries(specialChars)) {
        TestUtils.logTestInfo('Special Characters Test', `Testing: ${name}`);
        
        await loginPage.fillMaliciousInput(payload);
        await loginPage.signInButton.click();
        
        await loginPage.expectStillOnLoginPage();
      }
    });

    test('should handle very long inputs', async ({ page }) => {
      const longStrings = TestData.LONG_STRINGS;
      
      for (const [name, payload] of Object.entries(longStrings)) {
        TestUtils.logTestInfo('Long Input Test', `Testing: ${name}`);
        
        await loginPage.fillMaliciousInput(payload);
        await loginPage.signInButton.click();
        
        await loginPage.expectStillOnLoginPage();
      }
    });

    test('should verify security headers', async ({ page }) => {
      await TestUtils.verifySecurityHeaders(page);
    });
  });

  test.describe('Navigation and Links', () => {
    test('should navigate to forgot password page', async ({ page }) => {
      await loginPage.clickForgotPassword();
      await expect(page).not.toHaveURL(TestData.LOGIN_URL);
    });

    test('should navigate to create account page', async ({ page }) => {
      await loginPage.clickCreateAccount();
      await expect(page).not.toHaveURL(TestData.LOGIN_URL);
    });

    test('should navigate to help page', async ({ page }) => {
      await loginPage.clickHelp();
      await expect(page).not.toHaveURL(TestData.LOGIN_URL);
    });

    test('should navigate to conditions of use', async ({ page }) => {
      await loginPage.clickConditions();
      await expect(page).not.toHaveURL(TestData.LOGIN_URL);
    });

    test('should navigate to privacy notice', async ({ page }) => {
      await loginPage.clickPrivacy();
      await expect(page).not.toHaveURL(TestData.LOGIN_URL);
    });
  });

  test.describe('Performance and Responsiveness', () => {
    test('should load page within reasonable time', async ({ page }) => {
      const loadTime = await TestUtils.measurePageLoadTime(page, TestData.LOGIN_URL);
      expect(loadTime).toBeLessThan(TestData.DEFAULT_TIMEOUT);
    });

    test('should be responsive on different viewports', async ({ page }) => {
      await TestUtils.testResponsiveDesign(page);
    });

    test('should handle rapid form submissions', async ({ page }) => {
      const credentials = TestData.getCredentials('success');
      
      await loginPage.fillCredentials(credentials.username, credentials.password);
      
      // Perform multiple rapid submissions
      for (let i = 0; i < 3; i++) {
        await loginPage.signInButton.click();
        await page.waitForTimeout(100);
      }
      
      // Should handle gracefully
      await expect(page.locator('body')).toBeVisible();
    });

    test('should test rate limiting', async ({ page }) => {
      await TestUtils.testRateLimiting(page);
    });
  });

  test.describe('Edge Cases and Error Handling', () => {
    test('should handle concurrent login attempts', async ({ page }) => {
      const credentials = TestData.getCredentials('success');
      
      // Simulate concurrent attempts
      await Promise.all([
        loginPage.login(credentials.username, credentials.password),
        loginPage.login(credentials.username, credentials.password),
        loginPage.login(credentials.username, credentials.password)
      ]);
      
      // Should handle gracefully
      await expect(page.locator('body')).toBeVisible();
    });

    test('should handle network interruptions', async ({ page }) => {
      const credentials = TestData.getCredentials('success');
      
      // Use retry mechanism for network issues
      await TestUtils.retryWithBackoff(async () => {
        await loginPage.login(credentials.username, credentials.password);
        await loginPage.expectNotOnLoginPage();
      });
    });

    test('should handle browser back/forward navigation', async ({ page }) => {
      const credentials = TestData.getCredentials('success');
      
      await loginPage.login(credentials.username, credentials.password);
      await loginPage.expectNotOnLoginPage();
      
      // Go back
      await page.goBack();
      await loginPage.expectStillOnLoginPage();
      
      // Go forward
      await page.goForward();
      await loginPage.expectNotOnLoginPage();
    });
  });

  test.describe('Mobile and Touch Interactions', () => {
    test('should work on mobile devices', async ({ page }) => {
      await loginPage.setMobileViewport();
      await loginPage.expectMobileElementsVisible();
      
      const credentials = TestData.getCredentials('success');
      
      // Test touch interactions
      await loginPage.usernameField.tap();
      await loginPage.usernameField.fill(credentials.username);
      
      await loginPage.passwordField.tap();
      await loginPage.passwordField.fill(credentials.password);
      
      await loginPage.signInButton.tap();
      await loginPage.expectNotOnLoginPage();
    });
  });
}); 