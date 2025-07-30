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
    await loginPage.expectFormElementsVisible();
    await loginPage.usernameField.fill('test_user');
    await loginPage.passwordField.fill('test_pass');
    await expect(loginPage.usernameField).toHaveValue('test_user');
    await expect(loginPage.passwordField).toHaveValue('test_pass');
  });

  test('should click sign in button', async ({ page }) => {
    await loginPage.goto();
    await loginPage.expectFormElementsVisible();
    await loginPage.usernameField.fill('test_user');
    await loginPage.passwordField.fill('test_pass');
    await loginPage.signInButton.click();
    await page.waitForLoadState('networkidle');
    await loginPage.expectNoErrorMessages();
    await expect(page).toHaveURL(/\/products/);
  });

  test('should handle invalid credentials gracefully', async ({ page }) => {
    await loginPage.goto();
    await loginPage.expectFormElementsVisible();
    await loginPage.usernameField.fill('invalid_user');
    await loginPage.passwordField.fill('invalid_pass');
    await loginPage.passwordField.press('Enter');
    await page.waitForLoadState('networkidle');
    // Credenciais inválidas devem permanecer na página de login
    await loginPage.expectStillOnLoginPage();
  });

  test('should test form validation', async ({ page }) => {
    await loginPage.goto();
    await loginPage.expectFormElementsVisible();
    // Tenta submeter o formulário vazio
    await loginPage.passwordField.press('Enter');
    await page.waitForLoadState('networkidle');
    await loginPage.expectStillOnLoginPage();
  });
}); 