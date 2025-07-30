import { Page, Locator, expect } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly usernameField: Locator;
  readonly passwordField: Locator;
  readonly signInButton: Locator;
  readonly keepSignedInCheckbox: Locator;
  readonly forgotPasswordLink: Locator;
  readonly createAccountLink: Locator;
  readonly helpLink: Locator;
  readonly conditionsLink: Locator;
  readonly privacyLink: Locator;
  readonly testCredentialsSection: Locator;
  readonly errorMessages: Locator;

  constructor(page: Page) {
    this.page = page;
    
    // Form elements
    this.usernameField = page.getByLabel('Username');
    this.passwordField = page.getByLabel('Password');
    this.signInButton = page.getByRole('button', { name: 'Sign in' });
    this.keepSignedInCheckbox = page.getByText('Keep me signed in').first();
    
    // Navigation links
    this.forgotPasswordLink = page.getByText('Forgot your password?');
    this.createAccountLink = page.getByText('Create your ImagineX Deals account');
    this.helpLink = page.getByRole('link', { name: 'Help' }).first();
    this.conditionsLink = page.getByRole('link', { name: 'Conditions of Use' }).first();
    this.privacyLink = page.getByRole('link', { name: 'Privacy Notice' }).first();
    
    // Content sections
    this.testCredentialsSection = page.getByText('Test Credentials');
    this.errorMessages = page.locator('[class*="error"], [class*="alert"], [class*="message"]');
  }

  // Navigation
  async goto() {
    await this.page.goto('/login');
  }

  // Form interactions
  async fillCredentials(username: string, password: string) {
    await this.usernameField.fill(username);
    await this.passwordField.fill(password);
  }

  async login(username: string, password: string, keepSignedIn = false) {
    await this.fillCredentials(username, password);
    
    if (keepSignedIn) {
      await this.keepSignedInCheckbox.click();
    }
    
    await this.signInButton.click();
  }

  async loginWithEnter(username: string, password: string) {
    await this.fillCredentials(username, password);
    await this.passwordField.press('Enter');
  }

  // Validation methods
  async expectPageLoaded() {
    await expect(this.page).toHaveTitle(/ImagineX Deals/);
    await expect(this.page.getByRole('heading', { name: 'Sign in' })).toBeVisible();
  }

  async expectFormElementsVisible() {
    await expect(this.usernameField).toBeVisible();
    await expect(this.passwordField).toBeVisible();
    await expect(this.signInButton).toBeVisible();
  }

  async expectPasswordFieldMasked() {
    await expect(this.passwordField).toHaveAttribute('type', 'password');
  }

  async expectTestCredentialsVisible() {
    await expect(this.testCredentialsSection).toBeVisible();
    await expect(this.page.getByText('Username: test_user / Password: test_pass (successful payments)')).toBeVisible();
    await expect(this.page.getByText('Username: test_failure / Password: test_pass (failed payments)')).toBeVisible();
  }

  async expectNoErrorMessages() {
    await expect(this.errorMessages).toHaveCount(0);
  }

  async expectErrorMessages() {
    await expect(this.errorMessages).toHaveCount(1);
  }

  // Navigation methods
  async clickForgotPassword() {
    await this.forgotPasswordLink.click();
  }

  async clickCreateAccount() {
    await this.createAccountLink.click();
  }

  async clickHelp() {
    await this.helpLink.click();
  }

  async clickConditions() {
    await this.conditionsLink.click();
  }

  async clickPrivacy() {
    await this.privacyLink.click();
  }

  // Utility methods
  async getPageContent() {
    return await this.page.content();
  }

  async getPageText() {
    return await this.page.textContent('body') || '';
  }

  async waitForNavigation() {
    await this.page.waitForLoadState('networkidle');
  }

  // Security testing methods
  async fillMaliciousInput(payload: string) {
    await this.usernameField.fill(payload);
    await this.passwordField.fill(payload);
  }

  async expectStillOnLoginPage() {
    await expect(this.page).toHaveURL('/login');
  }

  async expectNotOnLoginPage() {
    // Wait for navigation and check if we're no longer on login page
    await this.page.waitForLoadState('networkidle');
    const currentUrl = this.page.url();
    expect(currentUrl).not.toContain('/login');
  }

  // Accessibility methods
  async expectTabOrder() {
    await this.page.keyboard.press('Tab');
    await expect(this.usernameField).toBeFocused();
    
    await this.page.keyboard.press('Tab');
    await expect(this.passwordField).toBeFocused();
    
    await this.page.keyboard.press('Tab');
    await expect(this.signInButton).toBeFocused();
  }

  // Mobile testing methods
  async setMobileViewport() {
    await this.page.setViewportSize({ width: 375, height: 667 });
  }

  async expectMobileElementsVisible() {
    await expect(this.page.getByRole('heading', { name: 'Sign in' })).toBeVisible();
    await expect(this.usernameField).toBeVisible();
    await expect(this.passwordField).toBeVisible();
    await expect(this.signInButton).toBeVisible();
  }
} 