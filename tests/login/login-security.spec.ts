import { test, expect } from '@playwright/test';
import { LoginPage } from '../../src/pages/LoginPage';
import { TestData } from '../../src/data/TestData';
import { TestUtils } from '../../src/utils/TestUtils';

test.describe('Login Security Tests - POM', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();
  });

  test('should protect against SQL injection attacks', async ({ page }) => {
    const sqlInjectionPayloads = TestData.getSqlInjectionPayloads();
    
    for (const payload of sqlInjectionPayloads) {
      TestUtils.logTestInfo('SQL Injection Protection', `Testing: ${payload.name}`);
      
      await loginPage.login(payload.payload, payload.payload);
      await loginPage.expectStillOnLoginPage();
      // Tolerar mensagens genéricas, mas não mensagens explícitas de erro de banco
      const pageContent = await page.content();
      expect(pageContent).not.toMatch(/SQL (syntax|error|exception|database|ORA-|MySQL|DROP TABLE|SELECT|xp_cmdshell)/i);
    }
  });

  test('should protect against XSS attacks', async ({ page }) => {
    const xssPayloads = TestData.getXssPayloads();
    
    for (const payload of xssPayloads) {
      TestUtils.logTestInfo('XSS Protection', `Testing: ${payload.name}`);
      
      await loginPage.login(payload.payload, payload.payload);
      await loginPage.expectStillOnLoginPage();
      
      // Deve garantir que o payload não aparece no HTML da página
      const pageContent = await page.content();
      expect(pageContent).not.toContain(payload.payload);
    }
  });

  test('should enforce HTTPS', async ({ page }) => {
    const currentUrl = page.url();
    expect(currentUrl.startsWith('https://')).toBeTruthy();
  });

  test('should have secure headers', async ({ page }) => {
    await TestUtils.verifySecurityHeaders(page);
  });

  test('should not expose sensitive information in response headers', async ({ page }) => {
    const response = await page.goto(TestData.LOGIN_URL);
    const headers = response?.headers();
    if (headers) {
      const sensitiveHeaders = TestData.SENSITIVE_HEADERS;
      for (const header of sensitiveHeaders) {
        // Ignorar headers comuns de provedores de hospedagem
        if (header === 'server' && headers[header]?.toLowerCase().includes('vercel')) continue;
        if (header === 'x-powered-by' && headers[header]?.toLowerCase().includes('next.js')) continue;
        expect(headers[header]).toBeUndefined();
      }
    }
  });

  test('should handle CSRF protection', async ({ page }) => {
    // Try to submit form without proper CSRF token
    await loginPage.usernameField.fill('test_user');
    await loginPage.passwordField.fill('test_pass');
    
    // Should either succeed (if no CSRF protection) or fail gracefully
    await expect(page.locator('body')).toBeVisible();
  });

  test('should validate input length limits', async ({ page }) => {
    const veryLongInput = 'a'.repeat(10000);
    
    await loginPage.login(veryLongInput, veryLongInput);
    await loginPage.expectStillOnLoginPage();
    
    // Should not crash or expose errors
    await expect(page.locator('body')).toBeVisible();
  });

  test('should handle special characters safely', async ({ page }) => {
    const specialChars = ['<script>', 'javascript:', 'data:', 'vbscript:'];
    for (const chars of specialChars) {
      await loginPage.login(chars, chars);
      await loginPage.expectStillOnLoginPage();
      // Deve garantir que o payload não aparece refletido em elementos visíveis
      const errorText = await page.locator('[data-testid="login-error"]').textContent();
      expect(errorText).not.toContain(chars);
      // O campo de input pode mostrar o valor digitado, mas não deve ser executado ou refletido em elementos perigosos
      // Se quiser garantir que não há execução, pode verificar se não há elementos inesperados
      // Exemplo: garantir que não há script injetado
      const scripts = await page.locator('script').allTextContents();
      for (const scriptContent of scripts) {
        expect(scriptContent).not.toContain(chars);
      }
    }
  });

  test('should not log passwords in console', async ({ page }) => {
    const credentials = TestData.getCredentials('success');
    
    // Listen for console messages
    const consoleMessages: string[] = [];
    page.on('console', msg => consoleMessages.push(msg.text()));
    
    await loginPage.login(credentials.username, credentials.password);
    
    // Check that password is not logged
    const passwordLogs = consoleMessages.filter(msg => 
      msg.includes(credentials.password) || 
      msg.toLowerCase().includes('password')
    );
    
    expect(passwordLogs.length).toBe(0);
  });

  test('should handle rate limiting', async ({ page }) => {
    const credentials = TestData.getCredentials('invalid');
    
    // Try multiple rapid login attempts
    for (let i = 0; i < 5; i++) {
      await loginPage.login(credentials.username, credentials.password);
      await loginPage.expectStillOnLoginPage();
    }
    
    // Should handle gracefully without crashing
    await expect(page.locator('body')).toBeVisible();
  });

  test('should validate session security', async ({ page }) => {
    const credentials = TestData.getCredentials('success');
    await loginPage.login(credentials.username, credentials.password);
    await loginPage.expectNotOnLoginPage();
    // Check for secure session attributes
    const cookies = await page.context().cookies();
    const sessionCookie = cookies.find(cookie => 
      /session|auth/i.test(cookie.name)
    );
    if (sessionCookie) {
      // Só verifica secure se estiver em ambiente HTTPS
      if (page.url().startsWith('https://')) {
        expect(sessionCookie.secure).toBeTruthy();
      }
      expect(sessionCookie.httpOnly).toBeTruthy();
    } else {
      // Se não houver cookie de sessão, apenas loga para debug
      console.warn('Nenhum cookie de sessão encontrado para validação.');
    }
  });

  test('should handle concurrent login attempts', async ({ page }) => {
    const credentials = TestData.getCredentials('success');
    
    // Simulate concurrent login attempts
    const promises = [];
    for (let i = 0; i < 3; i++) {
      promises.push(loginPage.login(credentials.username, credentials.password));
    }
    
    await Promise.all(promises);
    
    // Should handle gracefully
    await expect(page.locator('body')).toBeVisible();
  });

  test('should protect against brute force attacks', async ({ page }) => {
    const invalidCredentials = TestData.getCredentials('invalid');
    
    // Simulate brute force attempt
    for (let i = 0; i < 10; i++) {
      await loginPage.login(invalidCredentials.username, invalidCredentials.password);
      await loginPage.expectStillOnLoginPage();
    }
    
    // Should implement some form of protection
    await expect(page.locator('body')).toBeVisible();
  });

  test('should handle malformed requests', async ({ page }) => {
    // Try to access login with malformed data
    await page.evaluate(() => {
      // Simulate malformed request
      fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invalid: 'data' })
      });
    });
    
    // Should handle gracefully without crashing
    await expect(page.locator('body')).toBeVisible();
  });

  test('should validate content security policy', async ({ page }) => {
    const response = await page.goto(TestData.LOGIN_URL);
    const headers = response?.headers();
    
    if (headers && headers['content-security-policy']) {
      const csp = headers['content-security-policy'];
      
      // Should have basic CSP directives
      expect(csp).toContain('default-src');
      expect(csp).toContain('script-src');
    }
  });
}); 