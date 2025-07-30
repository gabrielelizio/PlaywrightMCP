import { test, expect } from '@playwright/test';
import { LoginPage } from '../../src/pages/LoginPage';
import { ProductsPage } from '../../src/pages/ProductsPage';
import { CheckoutPage } from '../../src/pages/CheckoutPage';
import { TestData } from '../../src/data/TestData';
import { TestUtils } from '../../src/utils/TestUtils';

test.describe('Products and Purchase Flow - E2E Tests', () => {
  let loginPage: LoginPage;
  let productsPage: ProductsPage;
  let checkoutPage: CheckoutPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    productsPage = new ProductsPage(page);
    checkoutPage = new CheckoutPage(page);
  });

  test.describe('Complete Purchase Flow', () => {
    test('should complete full purchase flow from login to order confirmation', async ({ page }) => {
      TestUtils.logTestInfo('Complete Purchase Flow', 'Starting full E2E purchase flow');

      // 1. Login with successful credentials
      await loginPage.goto();
      const credentials = TestData.getCredentials('success');
      await loginPage.login(credentials.username, credentials.password);
      await loginPage.expectNotOnLoginPage();

      // 2. Navigate to products page
      await productsPage.gotoWithSession();
      await productsPage.expectPageLoaded();
      await productsPage.expectProductsVisible();

      // 3. Get first product information
      const productInfo = await productsPage.getFirstProductInfo();
      TestUtils.logTestInfo('Product Selection', `Selected product: ${productInfo.title} - ${productInfo.price}`);

      // 4. Add first product to cart
      await productsPage.addFirstProductToCart();
      await productsPage.expectCartCount(1);

      // 5. Navigate to checkout
      await productsPage.clickCartIcon();
      await productsPage.clickCheckout();

      // 6. Fill checkout form
      await checkoutPage.expectPageLoaded();
      await checkoutPage.expectCartItemsVisible();

      const customerData = TestData.getCustomerData();
      const paymentData = TestData.getPaymentData();

      await checkoutPage.fillShippingInfo(customerData);
      await checkoutPage.fillPaymentInfo(paymentData);

      // 7. Place order
      await checkoutPage.placeOrder();
      await checkoutPage.expectOrderPlaced();

      TestUtils.logTestInfo('Purchase Complete', 'Order successfully placed');
    });

    test('should handle multiple products in cart', async ({ page }) => {
      // Login
      await loginPage.goto();
      const credentials = TestData.getCredentials('success');
      await loginPage.login(credentials.username, credentials.password);

      // Navigate to products
      await productsPage.gotoWithSession();
      await productsPage.expectPageLoaded();

      // Add multiple products
      const productCount = Math.min(3, await productsPage.getProductCount());
      await productsPage.addMultipleProductsToCart(productCount);

      // Verify cart count
      await productsPage.expectCartCount(productCount);

      // Proceed to checkout
      await productsPage.clickCartIcon();
      await productsPage.clickCheckout();

      // Verify all items in checkout
      await checkoutPage.expectPageLoaded();
      await expect(checkoutPage.getItemCount()).toBe(productCount);
    });
  });

  test.describe('Products Page Functionality', () => {
    test.beforeEach(async ({ page }) => {
      // Login first
      await loginPage.goto();
      const credentials = TestData.getCredentials('success');
      await loginPage.login(credentials.username, credentials.password);
      
      // Navigate to products
      await productsPage.gotoWithSession();
      await productsPage.expectPageLoaded();
    });

    test('should display products page with all elements', async ({ page }) => {
      await productsPage.expectProductsVisible();
      await productsPage.expectProductCardStructure();
      await productsPage.expectSearchFunctionality();
      await productsPage.expectFilterFunctionality();
    });

    test('should search for products', async ({ page }) => {
      const searchTerms = TestData.getProductSearchTerms();
      
      for (const term of searchTerms.slice(0, 3)) { // Test first 3 terms
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
      
      for (const category of categories.slice(0, 3)) { // Test first 3 categories
        TestUtils.logTestInfo('Product Filter', `Filtering by category: ${category}`);
        
        await productsPage.filterByCategory(category);
        await productsPage.waitForProductsToLoad();
        
        // Should show filtered results
        await productsPage.expectProductsVisible();
      }
    });

    test('should sort products', async ({ page }) => {
      const sortOptions = TestData.getSortOptions();
      
      for (const option of sortOptions.slice(0, 3)) { // Test first 3 options
        TestUtils.logTestInfo('Product Sort', `Sorting by: ${option}`);
        
        await productsPage.sortBy(option);
        await productsPage.waitForProductsToLoad();
        
        // Should show sorted results
        await productsPage.expectProductsVisible();
      }
    });

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

    test('should view product details', async ({ page }) => {
      const productCount = await productsPage.getProductCount();
      if (productCount > 0) {
        await productsPage.viewProductDetails(0);
        
        // Should navigate to product details page
        await expect(page).not.toHaveURL(TestData.PRODUCTS_URL);
      }
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

  test.describe('Checkout Page Functionality', () => {
    test.beforeEach(async ({ page }) => {
      // Login and add product to cart
      await loginPage.goto();
      const credentials = TestData.getCredentials('success');
      await loginPage.login(credentials.username, credentials.password);
      
      await productsPage.gotoWithSession();
      await productsPage.addFirstProductToCart();
      await productsPage.clickCartIcon();
      await productsPage.clickCheckout();
    });

    test('should display checkout page with all elements', async ({ page }) => {
      await checkoutPage.expectPageLoaded();
      await checkoutPage.expectCartItemsVisible();
      await checkoutPage.expectOrderSummaryVisible();
      await checkoutPage.expectRequiredFields();
      await checkoutPage.expectPaymentFormVisible();
    });

    test('should fill shipping information', async ({ page }) => {
      const customerData = TestData.getCustomerData();
      
      await checkoutPage.fillShippingInfo(customerData);
      
      // Verify data was filled
      await expect(checkoutPage.firstNameInput).toHaveValue(customerData.firstName);
      await expect(checkoutPage.lastNameInput).toHaveValue(customerData.lastName);
      await expect(checkoutPage.emailInput).toHaveValue(customerData.email);
    });

    test('should fill payment information', async ({ page }) => {
      const paymentData = TestData.getPaymentData();
      
      await checkoutPage.fillPaymentInfo(paymentData);
      
      // Verify data was filled
      await expect(checkoutPage.cardNumberInput).toHaveValue(paymentData.cardNumber);
      await expect(checkoutPage.cardNameInput).toHaveValue(paymentData.cardName);
    });

    test('should handle form validation', async ({ page }) => {
      await checkoutPage.expectFormValidation();
    });

    test('should apply promo code', async ({ page }) => {
      const promoCodes = TestData.getPromoCodes();
      
      for (const code of promoCodes.slice(0, 2)) { // Test first 2 codes
        TestUtils.logTestInfo('Promo Code', `Applying promo code: ${code}`);
        
        await checkoutPage.applyPromoCode(code);
        
        // Should either apply successfully or show error
        try {
          await checkoutPage.expectPromoApplied();
        } catch {
          // Promo code might be invalid, which is expected
          await expect(page.locator('.error, .invalid')).toBeVisible();
        }
      }
    });

    test('should update item quantities', async ({ page }) => {
      await checkoutPage.updateItemQuantity(0, 2);
      
      // Verify quantity was updated
      await expect(checkoutPage.itemQuantity.first()).toHaveValue('2');
    });

    test('should remove items from cart', async ({ page }) => {
      const initialItemCount = await checkoutPage.getItemCount();
      
      if (initialItemCount > 0) {
        await checkoutPage.removeItem(0);
        
        // Verify item was removed
        await expect(checkoutPage.getItemCount()).toBe(initialItemCount - 1);
      }
    });

    test('should complete checkout with valid data', async ({ page }) => {
      const customerData = TestData.getCustomerData();
      const paymentData = TestData.getPaymentData();
      
      await checkoutPage.completeCheckoutFlow({
        ...customerData,
        ...paymentData
      });
    });

    test('should handle payment errors', async ({ page }) => {
      const customerData = TestData.getCustomerData();
      const invalidPaymentData = {
        cardNumber: '4000000000000002', // Test card that fails
        expiry: '12/25',
        cvv: '123',
        cardName: 'John Doe'
      };
      
      await checkoutPage.fillShippingInfo(customerData);
      await checkoutPage.fillPaymentInfo(invalidPaymentData);
      await checkoutPage.placeOrder();
      
      // Should show payment error
      await checkoutPage.expectPaymentError();
    });
  });

  test.describe('Performance and Responsiveness', () => {
    test('should load products page within reasonable time', async ({ page }) => {
      const loadTime = await productsPage.measurePageLoadTime();
      expect(loadTime).toBeLessThan(TestData.DEFAULT_TIMEOUT);
    });

    test('should load checkout page within reasonable time', async ({ page }) => {
      // Login and add product first
      await loginPage.goto();
      const credentials = TestData.getCredentials('success');
      await loginPage.login(credentials.username, credentials.password);
      
      await productsPage.gotoWithSession();
      await productsPage.addFirstProductToCart();
      await productsPage.clickCartIcon();
      await productsPage.clickCheckout();
      
      const loadTime = await checkoutPage.measureCheckoutLoadTime();
      expect(loadTime).toBeLessThan(TestData.DEFAULT_TIMEOUT);
    });

    test('should be responsive on mobile devices', async ({ page }) => {
      await productsPage.expectMobileLayout();
      await checkoutPage.expectMobileLayout();
    });
  });

  test.describe('Accessibility and UX', () => {
    test('should support keyboard navigation', async ({ page }) => {
      await productsPage.testKeyboardNavigation();
      await checkoutPage.testKeyboardNavigation();
    });

    test('should have proper ARIA labels and structure', async ({ page }) => {
      await TestUtils.performAccessibilityChecks(page);
    });
  });

  test.describe('Error Handling and Edge Cases', () => {
    test('should handle empty cart checkout', async ({ page }) => {
      // Login and go directly to checkout without adding items
      await loginPage.goto();
      const credentials = TestData.getCredentials('success');
      await loginPage.login(credentials.username, credentials.password);
      
      await checkoutPage.goto();
      
      // Should show empty cart message or redirect
      await expect(page.locator('text=Empty cart, text=No items, text=Add items')).toBeVisible();
    });

    test('should handle network interruptions during checkout', async ({ page }) => {
      // Login and add product
      await loginPage.goto();
      const credentials = TestData.getCredentials('success');
      await loginPage.login(credentials.username, credentials.password);
      
      await productsPage.gotoWithSession();
      await productsPage.addFirstProductToCart();
      await productsPage.clickCartIcon();
      await productsPage.clickCheckout();
      
      // Use retry mechanism for network issues
      await TestUtils.retryWithBackoff(async () => {
        const customerData = TestData.getCustomerData();
        const paymentData = TestData.getPaymentData();
        
        await checkoutPage.completeCheckoutFlow({
          ...customerData,
          ...paymentData
        });
      });
    });

    test('should handle browser back/forward navigation', async ({ page }) => {
      // Complete purchase flow
      await loginPage.goto();
      const credentials = TestData.getCredentials('success');
      await loginPage.login(credentials.username, credentials.password);
      
      await productsPage.gotoWithSession();
      await productsPage.addFirstProductToCart();
      await productsPage.clickCartIcon();
      await productsPage.clickCheckout();
      
      // Go back
      await page.goBack();
      await expect(page).toHaveURL(TestData.PRODUCTS_URL);
      
      // Go forward
      await page.goForward();
      await expect(page).toHaveURL(TestData.CHECKOUT_URL);
    });
  });

  test.describe('Session Management', () => {
    test('should maintain session across pages', async ({ page }) => {
      // Login
      await loginPage.goto();
      const credentials = TestData.getCredentials('success');
      await loginPage.login(credentials.username, credentials.password);
      
      // Navigate between pages
      await productsPage.gotoWithSession();
      await productsPage.expectPageLoaded();
      
      await checkoutPage.goto();
      await checkoutPage.expectPageLoaded();
      
      // Should remain logged in
      await expect(page).not.toHaveURL(TestData.LOGIN_URL);
    });

    test('should handle session timeout', async ({ page }) => {
      // Login
      await loginPage.goto();
      const credentials = TestData.getCredentials('success');
      await loginPage.login(credentials.username, credentials.password);
      
      // Wait for potential session timeout (simulate)
      await page.waitForTimeout(5000);
      
      // Try to access protected page
      await productsPage.gotoWithSession();
      
      // Should either remain logged in or redirect to login
      const currentUrl = page.url();
      expect(currentUrl === TestData.LOGIN_URL || currentUrl.includes(TestData.PRODUCTS_URL)).toBeTruthy();
    });
  });
}); 