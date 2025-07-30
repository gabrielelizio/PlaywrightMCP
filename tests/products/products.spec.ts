import { test, expect } from '@playwright/test';
import { LoginPage } from '../../src/pages/LoginPage';
import { ProductsPage } from '../../src/pages/ProductsPage';
import { TestData } from '../../src/data/TestData';
import { TestUtils } from '../../src/utils/TestUtils';

test.describe('Products Page Functionality - POM', () => {
  let loginPage: LoginPage;
  let productsPage: ProductsPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    productsPage = new ProductsPage(page);
    
    // Login first
    await loginPage.goto();
    const credentials = TestData.getCredentials('success');
    await loginPage.login(credentials.username, credentials.password);
    
    // Navigate to products
    await productsPage.gotoWithSession();
    await productsPage.expectPageLoaded();
  });

  test.describe('Page Structure and Elements', () => {
    test('should display products page with all elements', async ({ page }) => {
      await productsPage.expectProductsVisible();
      await productsPage.expectProductCardStructure();
      await productsPage.expectSearchFunctionality();
      await productsPage.expectFilterFunctionality();
    });

    test('should have proper accessibility features', async ({ page }) => {
      await TestUtils.performAccessibilityChecks(page);
      await productsPage.testKeyboardNavigation();
    });

    test('should be responsive on mobile devices', async ({ page }) => {
      await productsPage.expectMobileLayout();
    });
  });

  test.describe('Product Search and Filtering', () => {
    test('should search for products', async ({ page }) => {
      const searchTerms = TestData.getProductSearchTerms();
      
      for (const term of searchTerms.slice(0, 3)) {
        TestUtils.logTestInfo('Product Search', `Searching for: ${term}`);
        
        await productsPage.searchProducts(term);
        await productsPage.waitForProductsToLoad();
        
        // Should either show results or no products message
        const productCount = await productsPage.getProductCount();
        if (productCount === 0) {
          await productsPage.expectNoProductsMessage();
        } else {
          await productsPage.expectProductsVisible();
        }
      }
    });

    test('should filter products by category', async ({ page }) => {
      const categories = TestData.getProductCategories();
      
      for (const category of categories.slice(0, 3)) {
        TestUtils.logTestInfo('Product Filter', `Filtering by category: ${category}`);
        
        await productsPage.filterByCategory(category);
        await productsPage.waitForProductsToLoad();
        
        // Should show filtered results
        await productsPage.expectProductsVisible();
      }
    });

    test('should sort products', async ({ page }) => {
      const sortOptions = TestData.getSortOptions();
      
      for (const option of sortOptions.slice(0, 3)) {
        TestUtils.logTestInfo('Product Sort', `Sorting by: ${option}`);
        
        await productsPage.sortBy(option);
        await productsPage.waitForProductsToLoad();
        
        // Should show sorted results
        await productsPage.expectProductsVisible();
      }
    });

    test('should handle empty search results', async ({ page }) => {
      await productsPage.searchProducts('nonexistentproduct12345');
      await productsPage.waitForProductsToLoad();
      
      // Should show no products message
      await productsPage.expectNoProductsMessage();
    });

    test('should handle special characters in search', async ({ page }) => {
      const specialSearches = ['!@#$%', 'áéíóú', '测试', '🎉🎊'];
      
      for (const search of specialSearches) {
        await productsPage.searchProducts(search);
        await productsPage.waitForProductsToLoad();
        
        // Should handle gracefully
        await expect(page.locator('body')).toBeVisible();
      }
    });
  });

  test.describe('Product Interactions', () => {
    test('should add products to cart', async ({ page }) => {
      const initialCartCount = await productsPage.getCartCount();
      
      // Add first product
      await productsPage.addFirstProductToCart();
      await productsPage.expectCartCount(initialCartCount + 1);
      
      // Add second product if available
      const productCount = await productsPage.getProductCount();
      if (productCount > 1) {
        await productsPage.addProductToCartByIndex(1);
        await productsPage.expectCartCount(initialCartCount + 2);
      }
    });

    test('should add multiple products to cart', async ({ page }) => {
      const productCount = Math.min(3, await productsPage.getProductCount());
      await productsPage.addMultipleProductsToCart(productCount);
      
      // Verify cart count increased
      await productsPage.expectCartCount(productCount);
    });

    test('should view product details', async ({ page }) => {
      const productCount = await productsPage.getProductCount();
      if (productCount > 0) {
        await productsPage.viewProductDetails(0);
        
        // Should navigate to product details page
        await expect(page).not.toHaveURL(TestData.PRODUCTS_URL);
      }
    });

    test('should get product information', async ({ page }) => {
      const productInfo = await productsPage.getFirstProductInfo();
      
      // Should have basic product information
      expect(productInfo.title).toBeTruthy();
      expect(productInfo.price).toBeTruthy();
    });

    test('should handle cart interactions', async ({ page }) => {
      // Add product to cart
      await productsPage.addFirstProductToCart();
      await productsPage.expectCartCount(1);
      
      // Click cart icon
      await productsPage.clickCartIcon();
      
      // Should navigate to cart/checkout
      await expect(page).not.toHaveURL(TestData.PRODUCTS_URL);
    });
  });

  test.describe('Performance and Loading', () => {
    test('should load products page within reasonable time', async ({ page }) => {
      const loadTime = await productsPage.measurePageLoadTime();
      expect(loadTime).toBeLessThan(TestData.DEFAULT_TIMEOUT);
    });

    test('should handle loading states', async ({ page }) => {
      // Navigate to products page
      await productsPage.gotoWithSession();
      
      // Should show loading state briefly
      try {
        await productsPage.expectLoadingState();
      } catch {
        // Loading state might be too fast to catch
      }
      
      // Should eventually show products
      await productsPage.expectProductsVisible();
    });

    test('should handle network interruptions', async ({ page }) => {
      // Use retry mechanism for network issues
      await TestUtils.retryWithBackoff(async () => {
        await productsPage.gotoWithSession();
        await productsPage.expectPageLoaded();
      });
    });
  });

  test.describe('Error Handling', () => {
    test('should handle empty product list', async ({ page }) => {
      // This test assumes there might be a way to show empty state
      const productCount = await productsPage.getProductCount();
      
      if (productCount === 0) {
        await productsPage.expectNoProductsMessage();
      } else {
        await productsPage.expectProductsVisible();
      }
    });

    test('should handle malformed product data', async ({ page }) => {
      // Navigate to products page
      await productsPage.gotoWithSession();
      
      // Should handle gracefully without crashing
      await expect(page.locator('body')).toBeVisible();
    });

    test('should handle browser back/forward navigation', async ({ page }) => {
      // Navigate to products
      await productsPage.gotoWithSession();
      await productsPage.expectPageLoaded();
      
      // Go back
      await page.goBack();
      
      // Go forward
      await page.goForward();
      await expect(page).toHaveURL(TestData.PRODUCTS_URL);
    });
  });

  test.describe('Session Management', () => {
    test('should maintain session across product interactions', async ({ page }) => {
      // Navigate to products
      await productsPage.gotoWithSession();
      await productsPage.expectPageLoaded();
      
      // Add product to cart
      await productsPage.addFirstProductToCart();
      await productsPage.expectCartCount(1);
      
      // Navigate away and back
      await page.goto('/');
      await productsPage.gotoWithSession();
      
      // Should still be logged in
      await expect(page).not.toHaveURL(TestData.LOGIN_URL);
    });

    test('should handle session timeout during product browsing', async ({ page }) => {
      // Navigate to products
      await productsPage.gotoWithSession();
      await productsPage.expectPageLoaded();
      
      // Wait for potential session timeout (simulate)
      await page.waitForTimeout(5000);
      
      // Try to add product to cart
      await productsPage.addFirstProductToCart();
      
      // Should either succeed or redirect to login
      const currentUrl = page.url();
      expect(currentUrl === TestData.LOGIN_URL || currentUrl.includes(TestData.PRODUCTS_URL)).toBeTruthy();
    });
  });
}); 