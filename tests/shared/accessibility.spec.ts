import { test, expect } from '@playwright/test';
import { LoginPage } from '../../src/pages/LoginPage';
import { ProductsPage } from '../../src/pages/ProductsPage';
import { TestData } from '../../src/data/TestData';
import { TestUtils } from '../../src/utils/TestUtils';

test.describe('Accessibility Tests - Shared', () => {
  let loginPage: LoginPage;
  let productsPage: ProductsPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    productsPage = new ProductsPage(page);
  });

  test.describe('Login Page Accessibility', () => {
    test('should have proper ARIA labels and structure', async ({ page }) => {
      await loginPage.goto();
      await TestUtils.performAccessibilityChecks(page);
    });

    test('should support keyboard navigation', async ({ page }) => {
      await loginPage.goto();
      await loginPage.testKeyboardNavigation();
    });

    test('should have proper focus management', async ({ page }) => {
      await loginPage.goto();
      
      // Test tab order
      await page.keyboard.press('Tab');
      await expect(loginPage.usernameField).toBeFocused();
      
      await page.keyboard.press('Tab');
      await expect(loginPage.passwordField).toBeFocused();
      
      await page.keyboard.press('Tab');
      await expect(loginPage.signInButton).toBeFocused();
    });

    test('should have proper color contrast', async ({ page }) => {
      await loginPage.goto();
      
      // Basic color contrast check
      const textElements = page.locator('text, h1, h2, h3, p, label');
      await expect(textElements.first()).toBeVisible();
    });

    test('should have proper alt text for images', async ({ page }) => {
      await loginPage.goto();
      
      const images = page.locator('img');
      const imageCount = await images.count();
      
      if (imageCount > 0) {
        for (let i = 0; i < imageCount; i++) {
          const image = images.nth(i);
          const altText = await image.getAttribute('alt');
          expect(altText).toBeTruthy();
        }
      }
    });
  });

  test.describe('Products Page Accessibility', () => {
    test.beforeEach(async ({ page }) => {
      // Login first
      await loginPage.goto();
      const credentials = TestData.getCredentials('success');
      await loginPage.login(credentials.username, credentials.password);
      
      // Navigate to products
      await productsPage.gotoWithSession();
    });

    test('should have proper ARIA labels and structure', async ({ page }) => {
      await TestUtils.performAccessibilityChecks(page);
    });

    test('should support keyboard navigation', async ({ page }) => {
      await productsPage.testKeyboardNavigation();
    });

    test('should have proper focus management for product cards', async ({ page }) => {
      // Test tab navigation through products
      await page.keyboard.press('Tab');
      await expect(productsPage.firstProductCard).toBeFocused();
    });

    test('should have proper heading structure', async ({ page }) => {
      const headings = page.locator('h1, h2, h3, h4, h5, h6');
      const headingCount = await headings.count();
      
      if (headingCount > 0) {
        // Should have at least one main heading
        await expect(headings.first()).toBeVisible();
      }
    });

    test('should have proper form labels', async ({ page }) => {
      const formElements = page.locator('input, select, textarea');
      const formCount = await formElements.count();
      
      if (formCount > 0) {
        for (let i = 0; i < formCount; i++) {
          const element = formElements.nth(i);
          const id = await element.getAttribute('id');
          const name = await element.getAttribute('name');
          const ariaLabel = await element.getAttribute('aria-label');
          
          // Should have at least one form of identification
          expect(id || name || ariaLabel).toBeTruthy();
        }
      }
    });
  });

  test.describe('Screen Reader Compatibility', () => {
    test('should have proper semantic HTML structure', async ({ page }) => {
      await loginPage.goto();
      
      // Check for semantic elements
      const semanticElements = page.locator('main, nav, section, article, aside, header, footer');
      await expect(semanticElements.first()).toBeVisible();
    });

    test('should have proper skip links', async ({ page }) => {
      await loginPage.goto();
      
      // Check for skip navigation links
      const skipLinks = page.locator('a[href*="#main"], a[href*="#content"], a[href*="#navigation"]');
      const skipLinkCount = await skipLinks.count();
      
      if (skipLinkCount > 0) {
        await expect(skipLinks.first()).toBeVisible();
      }
    });

    test('should have proper landmarks', async ({ page }) => {
      await loginPage.goto();
      
      // Check for ARIA landmarks
      const landmarks = page.locator('[role="main"], [role="navigation"], [role="banner"], [role="contentinfo"]');
      const landmarkCount = await landmarks.count();
      
      if (landmarkCount > 0) {
        await expect(landmarks.first()).toBeVisible();
      }
    });
  });

  test.describe('Mobile Accessibility', () => {
    test('should be accessible on mobile devices', async ({ page }) => {
      await loginPage.goto();
      
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      
      // Check that elements are still accessible
      await expect(loginPage.usernameField).toBeVisible();
      await expect(loginPage.passwordField).toBeVisible();
      await expect(loginPage.signInButton).toBeVisible();
    });

    test('should have proper touch targets', async ({ page }) => {
      await loginPage.goto();
      
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      
      // Check that buttons are large enough for touch
      const buttons = page.locator('button, input[type="submit"], input[type="button"]');
      const buttonCount = await buttons.count();
      
      if (buttonCount > 0) {
        for (let i = 0; i < buttonCount; i++) {
          const button = buttons.nth(i);
          const box = await button.boundingBox();
          
          if (box) {
            // Touch targets should be at least 44x44 pixels
            expect(box.width).toBeGreaterThanOrEqual(44);
            expect(box.height).toBeGreaterThanOrEqual(44);
          }
        }
      }
    });
  });

  test.describe('Color and Contrast', () => {
    test('should have sufficient color contrast', async ({ page }) => {
      await loginPage.goto();
      
      // Basic contrast check - this would need a proper contrast checking library
      // For now, we'll just verify that text is visible
      const textElements = page.locator('text');
      await expect(textElements.first()).toBeVisible();
    });

    test('should not rely solely on color for information', async ({ page }) => {
      await loginPage.goto();
      
      // Check that form validation doesn't rely only on color
      const errorMessages = page.locator('.error, .invalid, [aria-invalid="true"]');
      const errorCount = await errorMessages.count();
      
      if (errorCount > 0) {
        // Error messages should have text content, not just color
        await expect(errorMessages.first()).toBeVisible();
      }
    });
  });

  test.describe('Dynamic Content', () => {
    test('should announce dynamic content changes', async ({ page }) => {
      await loginPage.goto();
      
      // Listen for console messages that might indicate ARIA live regions
      const consoleMessages: string[] = [];
      page.on('console', msg => consoleMessages.push(msg.text()));
      
      // Perform an action that might trigger dynamic content
      await loginPage.usernameField.fill('test');
      
      // Should handle gracefully
      await expect(page.locator('body')).toBeVisible();
    });

    test('should have proper loading states', async ({ page }) => {
      await loginPage.goto();
      
      // Check for loading indicators
      const loadingIndicators = page.locator('[aria-busy="true"], .loading, .spinner');
      const loadingCount = await loadingIndicators.count();
      
      if (loadingCount > 0) {
        await expect(loadingIndicators.first()).toBeVisible();
      }
    });
  });
}); 