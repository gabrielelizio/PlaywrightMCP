import { test, expect } from '@playwright/test';

// Test data
const TEST_CREDENTIALS = {
  success: {
    username: 'test_user',
    password: 'test_pass'
  },
  failure: {
    username: 'test_failure',
    password: 'test_pass'
  }
};

const LOGIN_URL = '/login';

test.describe('ImagineX Deals Login Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(LOGIN_URL);
  });

  test.describe('Page Structure and Elements', () => {
    test('should display login page with all required elements', async ({ page }) => {
      // Check page title
      await expect(page).toHaveTitle(/ImagineX Deals/);
      
      // Check main heading
      await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible();
      
      // Check form elements
      await expect(page.getByLabel('Username')).toBeVisible();
      await expect(page.getByLabel('Password')).toBeVisible();
      await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible();
      
      // Check additional elements
      await expect(page.getByText('Forgot your password?')).toBeVisible();
      await expect(page.getByText('Keep me signed in')).toBeVisible();
      await expect(page.getByText('Create your ImagineX Deals account')).toBeVisible();
    });

    test('should display test credentials section', async ({ page }) => {
      await expect(page.getByText('Test Credentials')).toBeVisible();
      await expect(page.getByText('Username: test_user / Password: test_pass (successful payments)')).toBeVisible();
      await expect(page.getByText('Username: test_failure / Password: test_pass (failed payments)')).toBeVisible();
    });

    test('should display footer links', async ({ page }) => {
      await expect(page.getByText('Conditions of Use')).toBeVisible();
      await expect(page.getByText('Privacy Notice')).toBeVisible();
      await expect(page.getByText('Help')).toBeVisible();
    });
  });

  test.describe('Form Validation', () => {
    test('should show validation for empty username', async ({ page }) => {
      const signInButton = page.getByRole('button', { name: 'Sign in' });
      await signInButton.click();
      
      // Check if form validation is triggered
      const usernameField = page.getByLabel('Username');
      await expect(usernameField).toBeFocused();
    });

    test('should show validation for empty password', async ({ page }) => {
      const usernameField = page.getByLabel('Username');
      await usernameField.fill('test_user');
      
      const signInButton = page.getByRole('button', { name: 'Sign in' });
      await signInButton.click();
      
      // Check if password field gets focus
      const passwordField = page.getByLabel('Password');
      await expect(passwordField).toBeFocused();
    });

    test('should allow typing in username field', async ({ page }) => {
      const usernameField = page.getByLabel('Username');
      await usernameField.fill('test_user');
      await expect(usernameField).toHaveValue('test_user');
    });

    test('should allow typing in password field', async ({ page }) => {
      const passwordField = page.getByLabel('Password');
      await passwordField.fill('test_pass');
      await expect(passwordField).toHaveValue('test_pass');
    });

    test('should mask password input', async ({ page }) => {
      const passwordField = page.getByLabel('Password');
      await passwordField.fill('test_pass');
      await expect(passwordField).toHaveAttribute('type', 'password');
    });
  });

  test.describe('Successful Login', () => {
    test('should login successfully with valid credentials', async ({ page }) => {
      const usernameField = page.getByLabel('Username');
      const passwordField = page.getByLabel('Password');
      const signInButton = page.getByRole('button', { name: 'Sign in' });

      await usernameField.fill(TEST_CREDENTIALS.success.username);
      await passwordField.fill(TEST_CREDENTIALS.success.password);
      await signInButton.click();

      // Wait for navigation or success message
      await expect(page).not.toHaveURL(LOGIN_URL);
    });

    test('should login with "Keep me signed in" checked', async ({ page }) => {
      const usernameField = page.getByLabel('Username');
      const passwordField = page.getByLabel('Password');
      const keepSignedInCheckbox = page.getByText('Keep me signed in').first();
      const signInButton = page.getByRole('button', { name: 'Sign in' });

      await usernameField.fill(TEST_CREDENTIALS.success.username);
      await passwordField.fill(TEST_CREDENTIALS.success.password);
      await keepSignedInCheckbox.click();
      await signInButton.click();

      await expect(page).not.toHaveURL(LOGIN_URL);
    });

    test('should handle login with Enter key', async ({ page }) => {
      const usernameField = page.getByLabel('Username');
      const passwordField = page.getByLabel('Password');

      await usernameField.fill(TEST_CREDENTIALS.success.username);
      await passwordField.fill(TEST_CREDENTIALS.success.password);
      await passwordField.press('Enter');

      await expect(page).not.toHaveURL(LOGIN_URL);
    });
  });

  test.describe('Failed Login', () => {
    test('should show error for failed login credentials', async ({ page }) => {
      const usernameField = page.getByLabel('Username');
      const passwordField = page.getByLabel('Password');
      const signInButton = page.getByRole('button', { name: 'Sign in' });

      await usernameField.fill(TEST_CREDENTIALS.failure.username);
      await passwordField.fill(TEST_CREDENTIALS.failure.password);
      await signInButton.click();

      // Should stay on login page or show error message
      await expect(page).toHaveURL(LOGIN_URL);
    });

    test('should show error for invalid credentials', async ({ page }) => {
      const usernameField = page.getByLabel('Username');
      const passwordField = page.getByLabel('Password');
      const signInButton = page.getByRole('button', { name: 'Sign in' });

      await usernameField.fill('invalid_user');
      await passwordField.fill('invalid_pass');
      await signInButton.click();

      // Should stay on login page
      await expect(page).toHaveURL(LOGIN_URL);
    });
  });

  test.describe('Navigation and Links', () => {
    test('should navigate to forgot password page', async ({ page }) => {
      const forgotPasswordLink = page.getByText('Forgot your password?');
      await forgotPasswordLink.click();
      
      // Should navigate to forgot password page
      await expect(page).not.toHaveURL(LOGIN_URL);
    });

    test('should navigate to create account page', async ({ page }) => {
      const createAccountLink = page.getByText('Create your ImagineX Deals account');
      await createAccountLink.click();
      
      // Should navigate to registration page
      await expect(page).not.toHaveURL(LOGIN_URL);
    });

    test('should navigate to help page', async ({ page }) => {
      const helpLink = page.getByText('Help');
      await helpLink.click();
      
      // Should navigate to help page
      await expect(page).not.toHaveURL(LOGIN_URL);
    });

    test('should navigate to conditions of use', async ({ page }) => {
      const conditionsLink = page.getByText('Conditions of Use');
      await conditionsLink.click();
      
      // Should navigate to conditions page
      await expect(page).not.toHaveURL(LOGIN_URL);
    });

    test('should navigate to privacy notice', async ({ page }) => {
      const privacyLink = page.getByText('Privacy Notice');
      await privacyLink.click();
      
      // Should navigate to privacy page
      await expect(page).not.toHaveURL(LOGIN_URL);
    });
  });

  test.describe('Accessibility and UX', () => {
    test('should have proper tab order', async ({ page }) => {
      await page.keyboard.press('Tab');
      await expect(page.getByLabel('Username')).toBeFocused();
      
      await page.keyboard.press('Tab');
      await expect(page.getByLabel('Password')).toBeFocused();
      
      await page.keyboard.press('Tab');
      await expect(page.getByRole('button', { name: 'Sign in' })).toBeFocused();
    });

    test('should have proper ARIA labels', async ({ page }) => {
      const usernameField = page.getByLabel('Username');
      const passwordField = page.getByLabel('Password');
      
      await expect(usernameField).toBeVisible();
      await expect(passwordField).toBeVisible();
    });

    test('should handle keyboard navigation', async ({ page }) => {
      const usernameField = page.getByLabel('Username');
      const passwordField = page.getByLabel('Password');
      const signInButton = page.getByRole('button', { name: 'Sign in' });

      await usernameField.focus();
      await expect(usernameField).toBeFocused();
      
      await page.keyboard.press('Tab');
      await expect(passwordField).toBeFocused();
      
      await page.keyboard.press('Tab');
      await expect(signInButton).toBeFocused();
    });
  });

  test.describe('Edge Cases', () => {
    test('should handle very long username', async ({ page }) => {
      const longUsername = 'a'.repeat(1000);
      const usernameField = page.getByLabel('Username');
      
      await usernameField.fill(longUsername);
      await expect(usernameField).toHaveValue(longUsername);
    });

    test('should handle very long password', async ({ page }) => {
      const longPassword = 'a'.repeat(1000);
      const passwordField = page.getByLabel('Password');
      
      await passwordField.fill(longPassword);
      await expect(passwordField).toHaveValue(longPassword);
    });

    test('should handle special characters in username', async ({ page }) => {
      const specialUsername = 'test@user#$%^&*()';
      const usernameField = page.getByLabel('Username');
      
      await usernameField.fill(specialUsername);
      await expect(usernameField).toHaveValue(specialUsername);
    });

    test('should handle special characters in password', async ({ page }) => {
      const specialPassword = 'test@pass#$%^&*()';
      const passwordField = page.getByLabel('Password');
      
      await passwordField.fill(specialPassword);
      await expect(passwordField).toHaveValue(specialPassword);
    });

    test('should handle spaces in username', async ({ page }) => {
      const usernameWithSpaces = 'test user with spaces';
      const usernameField = page.getByLabel('Username');
      
      await usernameField.fill(usernameWithSpaces);
      await expect(usernameField).toHaveValue(usernameWithSpaces);
    });

    test('should handle spaces in password', async ({ page }) => {
      const passwordWithSpaces = 'test pass with spaces';
      const passwordField = page.getByLabel('Password');
      
      await passwordField.fill(passwordWithSpaces);
      await expect(passwordField).toHaveValue(passwordWithSpaces);
    });
  });

  test.describe('Performance and Loading', () => {
    test('should load page within reasonable time', async ({ page }) => {
      const startTime = Date.now();
      await page.goto(LOGIN_URL);
      const loadTime = Date.now() - startTime;
      
      // Page should load within 5 seconds
      expect(loadTime).toBeLessThan(5000);
    });

    test('should handle rapid form submissions', async ({ page }) => {
      const usernameField = page.getByLabel('Username');
      const passwordField = page.getByLabel('Password');
      const signInButton = page.getByRole('button', { name: 'Sign in' });

      await usernameField.fill(TEST_CREDENTIALS.success.username);
      await passwordField.fill(TEST_CREDENTIALS.success.password);
      
      // Click multiple times rapidly
      await signInButton.click();
      await signInButton.click();
      await signInButton.click();
      
      // Should handle gracefully without errors
      await expect(page.locator('body')).toBeVisible();
    });
  });

  test.describe('Mobile Responsiveness', () => {
    test('should be responsive on mobile viewport', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      
      // All elements should still be visible
      await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible();
      await expect(page.getByLabel('Username')).toBeVisible();
      await expect(page.getByLabel('Password')).toBeVisible();
      await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible();
    });

    test('should work with touch interactions on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      
      const usernameField = page.getByLabel('Username');
      const passwordField = page.getByLabel('Password');
      const signInButton = page.getByRole('button', { name: 'Sign in' });

      await usernameField.tap();
      await usernameField.fill(TEST_CREDENTIALS.success.username);
      
      await passwordField.tap();
      await passwordField.fill(TEST_CREDENTIALS.success.password);
      
      await signInButton.tap();
      
      await expect(page).not.toHaveURL(LOGIN_URL);
    });
  });
}); 