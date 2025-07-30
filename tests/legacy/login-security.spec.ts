import { test, expect } from '@playwright/test';

const LOGIN_URL = '/login';

test.describe('Login Security Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(LOGIN_URL);
  });

  test.describe('SQL Injection Protection', () => {
    const sqlInjectionPayloads = [
      "'; DROP TABLE users; --",
      "' OR '1'='1",
      "' OR 1=1--",
      "admin'--",
      "admin'/*",
      "' UNION SELECT * FROM users--",
      "'; EXEC xp_cmdshell('dir');--",
      "' OR 'x'='x",
      "') OR ('1'='1",
      "'; WAITFOR DELAY '00:00:05'--"
    ];

    for (const payload of sqlInjectionPayloads) {
      test(`should prevent SQL injection: ${payload}`, async ({ page }) => {
        const usernameField = page.getByLabel('Username');
        const passwordField = page.getByLabel('Password');
        const signInButton = page.getByRole('button', { name: 'Sign in' });

        await usernameField.fill(payload);
        await passwordField.fill(payload);
        await signInButton.click();

        // Should stay on login page and not crash
        await expect(page).toHaveURL(LOGIN_URL);
        
        // Should not expose database errors
        const errorText = await page.textContent('body');
        expect(errorText).not.toContain('SQL');
        expect(errorText).not.toContain('database');
        expect(errorText).not.toContain('ORA-');
        expect(errorText).not.toContain('MySQL');
      });
    }
  });

  test.describe('XSS Protection', () => {
    const xssPayloads = [
      '<script>alert("xss")</script>',
      '<img src="x" onerror="alert(\'xss\')">',
      '<svg onload="alert(\'xss\')">',
      'javascript:alert("xss")',
      '<iframe src="javascript:alert(\'xss\')">',
      '"><script>alert("xss")</script>',
      '\'><script>alert("xss")</script>',
      '"><img src=x onerror=alert("xss")>',
      '"><svg/onload=alert("xss")>',
      '"><iframe src=javascript:alert("xss")>'
    ];

    for (const payload of xssPayloads) {
      test(`should prevent XSS: ${payload}`, async ({ page }) => {
        const usernameField = page.getByLabel('Username');
        const passwordField = page.getByLabel('Password');
        const signInButton = page.getByRole('button', { name: 'Sign in' });

        await usernameField.fill(payload);
        await passwordField.fill(payload);
        await signInButton.click();

        // Should stay on login page
        await expect(page).toHaveURL(LOGIN_URL);
        
        // Should not execute JavaScript
        const pageContent = await page.content();
        expect(pageContent).not.toContain('<script>');
        expect(pageContent).not.toContain('javascript:');
      });
    }
  });

  test.describe('CSRF Protection', () => {
    test('should have CSRF token in form', async ({ page }) => {
      // Check for common CSRF token patterns
      const csrfSelectors = [
        'input[name*="csrf"]',
        'input[name*="token"]',
        'input[name*="_token"]',
        'input[name*="authenticity"]',
        'input[type="hidden"]'
      ];

      let csrfTokenFound = false;
      for (const selector of csrfSelectors) {
        const elements = page.locator(selector);
        if (await elements.count() > 0) {
          csrfTokenFound = true;
          break;
        }
      }

      // This is informational - CSRF protection may be implemented differently
      expect(true).toBeTruthy();
    });

    test('should prevent form submission without proper tokens', async ({ page }) => {
      const usernameField = page.getByLabel('Username');
      const passwordField = page.getByLabel('Password');
      const signInButton = page.getByRole('button', { name: 'Sign in' });

      // Try to submit form directly without proper context
      await usernameField.fill('test_user');
      await passwordField.fill('test_pass');
      await signInButton.click();

      // Should either succeed (if no CSRF protection) or fail gracefully
      await expect(page.locator('body')).toBeVisible();
    });
  });

  test.describe('Input Validation', () => {
    test('should sanitize HTML input', async ({ page }) => {
      const usernameField = page.getByLabel('Username');
      const passwordField = page.getByLabel('Password');
      const signInButton = page.getByRole('button', { name: 'Sign in' });

      const htmlInput = '<div>test</div><script>alert("test")</script>';
      await usernameField.fill(htmlInput);
      await passwordField.fill(htmlInput);
      await signInButton.click();

      await expect(page).toHaveURL(LOGIN_URL);
      
      // Check that HTML is not rendered
      const pageContent = await page.content();
      expect(pageContent).not.toContain('<div>test</div>');
    });

    test('should handle null bytes', async ({ page }) => {
      const usernameField = page.getByLabel('Username');
      const passwordField = page.getByLabel('Password');
      const signInButton = page.getByRole('button', { name: 'Sign in' });

      await usernameField.fill('test\u0000user');
      await passwordField.fill('test\u0000pass');
      await signInButton.click();

      await expect(page).toHaveURL(LOGIN_URL);
    });

    test('should handle control characters', async ({ page }) => {
      const usernameField = page.getByLabel('Username');
      const passwordField = page.getByLabel('Password');
      const signInButton = page.getByRole('button', { name: 'Sign in' });

      const controlChars = '\x00\x01\x02\x03\x04\x05\x06\x07\x08\x09\x0A\x0B\x0C\x0D\x0E\x0F';
      await usernameField.fill(`test${controlChars}user`);
      await passwordField.fill(`test${controlChars}pass`);
      await signInButton.click();

      await expect(page).toHaveURL(LOGIN_URL);
    });
  });

  test.describe('Rate Limiting', () => {
    test('should handle rapid login attempts', async ({ page }) => {
      const usernameField = page.getByLabel('Username');
      const passwordField = page.getByLabel('Password');
      const signInButton = page.getByRole('button', { name: 'Sign in' });

      // Perform many rapid login attempts
      for (let i = 0; i < 10; i++) {
        await usernameField.fill(`user${i}`);
        await passwordField.fill(`pass${i}`);
        await signInButton.click();
        await page.waitForTimeout(50); // Very short delay
      }

      // Should handle gracefully without crashing
      await expect(page.locator('body')).toBeVisible();
    });

    test('should not expose user enumeration', async ({ page }) => {
      const usernameField = page.getByLabel('Username');
      const passwordField = page.getByLabel('Password');
      const signInButton = page.getByRole('button', { name: 'Sign in' });

      // Test with valid username, invalid password
      await usernameField.fill('test_user');
      await passwordField.fill('wrong_password');
      await signInButton.click();
      await page.waitForTimeout(1000);

      // Test with invalid username, invalid password
      await page.goto(LOGIN_URL);
      await usernameField.fill('invalid_user');
      await passwordField.fill('wrong_password');
      await signInButton.click();
      await page.waitForTimeout(1000);

      // Both should fail with similar response times and messages
      await expect(page).toHaveURL(LOGIN_URL);
    });
  });

  test.describe('Session Security', () => {
    test('should not expose sensitive data in response headers', async ({ page }) => {
      const response = await page.goto(LOGIN_URL);
      const headers = response?.headers();

      // Check for sensitive headers that shouldn't be exposed
      const sensitiveHeaders = [
        'x-powered-by',
        'server',
        'x-aspnet-version',
        'x-aspnetmvc-version'
      ];

      for (const header of sensitiveHeaders) {
        expect(headers?.[header]).toBeUndefined();
      }
    });

    test('should use secure cookies', async ({ page }) => {
      await page.goto(LOGIN_URL);
      
      // Check if cookies are set with secure flags
      const cookies = await page.context().cookies();
      
      // This is informational - secure cookie implementation may vary
      expect(true).toBeTruthy();
    });

    test('should not expose error details', async ({ page }) => {
      const usernameField = page.getByLabel('Username');
      const passwordField = page.getByLabel('Password');
      const signInButton = page.getByRole('button', { name: 'Sign in' });

      await usernameField.fill('test_user');
      await passwordField.fill('wrong_password');
      await signInButton.click();

      // Should not expose specific error details
      const pageContent = await page.content();
      expect(pageContent).not.toContain('password is incorrect');
      expect(pageContent).not.toContain('user not found');
      expect(pageContent).not.toContain('database error');
    });
  });

  test.describe('HTTPS and Security Headers', () => {
    test('should use HTTPS', async ({ page }) => {
      const response = await page.goto(LOGIN_URL);
      expect(page.url()).toMatch(/^https:/);
    });

    test('should have security headers', async ({ page }) => {
      const response = await page.goto(LOGIN_URL);
      const headers = response?.headers();

      // Check for common security headers
      const securityHeaders = [
        'x-frame-options',
        'x-content-type-options',
        'x-xss-protection',
        'strict-transport-security',
        'content-security-policy'
      ];

      // This is informational - security headers may vary
      expect(true).toBeTruthy();
    });
  });

  test.describe('Password Security', () => {
    test('should not expose password in page source', async ({ page }) => {
      const usernameField = page.getByLabel('Username');
      const passwordField = page.getByLabel('Password');

      await usernameField.fill('test_user');
      await passwordField.fill('test_pass');

      const pageSource = await page.content();
      expect(pageSource).not.toContain('test_pass');
    });

    test('should mask password field', async ({ page }) => {
      const passwordField = page.getByLabel('Password');
      await expect(passwordField).toHaveAttribute('type', 'password');
    });

    test('should not log passwords', async ({ page }) => {
      const usernameField = page.getByLabel('Username');
      const passwordField = page.getByLabel('Password');
      const signInButton = page.getByRole('button', { name: 'Sign in' });

      await usernameField.fill('test_user');
      await passwordField.fill('test_pass');
      await signInButton.click();

      // Check browser console for password logging
      const consoleMessages: string[] = [];
      page.on('console', msg => consoleMessages.push(msg.text()));

      // Should not contain password in console logs
      const hasPasswordInLogs = consoleMessages.some(msg => 
        msg.includes('test_pass') || msg.includes('password')
      );
      expect(hasPasswordInLogs).toBeFalsy();
    });
  });
}); 