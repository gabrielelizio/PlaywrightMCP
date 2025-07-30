import { Page, Locator, expect } from '@playwright/test';

export class ProductsPage {
  readonly page: Page;
  readonly productCards: Locator;
  readonly firstProductCard: Locator;
  readonly addToCartButtons: Locator;
  readonly cartIcon: Locator;
  readonly cartCount: Locator;
  readonly searchInput: Locator;
  readonly filterDropdown: Locator;
  readonly sortDropdown: Locator;
  readonly productTitle: Locator;
  readonly productPrice: Locator;
  readonly productDescription: Locator;
  readonly viewDetailsButton: Locator;
  readonly checkoutButton: Locator;
  readonly continueShoppingButton: Locator;

  constructor(page: Page) {
    this.page = page;
    
    // Product elements
    this.productCards = page.locator('[data-testid="product-card"], .product-card, .card');
    this.firstProductCard = this.productCards.first();
    this.addToCartButtons = page.locator('[data-testid="add-to-cart"], .add-to-cart, button:has-text("Add to Cart")');
    this.productTitle = page.locator('[data-testid="product-title"], .product-title, h3, h4');
    this.productPrice = page.locator('[data-testid="product-price"], .price, .product-price');
    this.productDescription = page.locator('[data-testid="product-description"], .description, .product-description');
    this.viewDetailsButton = page.locator('[data-testid="view-details"], .view-details, a:has-text("View Details")');
    
    // Cart elements
    this.cartIcon = page.locator('[data-testid="cart-icon"], .cart-icon, .shopping-cart');
    this.cartCount = page.locator('[data-testid="cart-count"], .cart-count, .badge');
    this.checkoutButton = page.locator('[data-testid="checkout"], .checkout, button:has-text("Checkout")');
    this.continueShoppingButton = page.locator('[data-testid="continue-shopping"], .continue-shopping, button:has-text("Continue Shopping")');
    
    // Filter and search elements
    this.searchInput = page.locator('[data-testid="search"], .search, input[type="search"], input[placeholder*="search"]');
    this.filterDropdown = page.locator('[data-testid="filter"], .filter, select');
    this.sortDropdown = page.locator('[data-testid="sort"], .sort, select');
  }

  // Navigation
  async goto() {
    await this.page.goto('/products');
  }

  async gotoWithSession() {
    // Assuming we're already logged in, just navigate to products
    await this.page.goto('/products');
  }

  // Page validation
  async expectPageLoaded() {
    await expect(this.page).toHaveTitle(/Products|ImagineX Deals/);
    await expect(this.productCards).toBeVisible();
  }

  async expectProductsVisible() {
    await expect(this.productCards).toHaveCount(1, { minimum: true });
  }

  // Product interactions
  async getFirstProductInfo() {
    const title = await this.firstProductCard.locator(this.productTitle).textContent() || '';
    const price = await this.firstProductCard.locator(this.productPrice).textContent() || '';
    const description = await this.firstProductCard.locator(this.productDescription).textContent() || '';
    
    return { title, price, description };
  }

  async selectFirstProduct() {
    await this.firstProductCard.click();
  }

  async addFirstProductToCart() {
    const addToCartButton = this.firstProductCard.locator(this.addToCartButtons);
    await addToCartButton.click();
  }

  async addProductToCartByIndex(index: number = 0) {
    const productCard = this.productCards.nth(index);
    const addToCartButton = productCard.locator(this.addToCartButtons);
    await addToCartButton.click();
  }

  async addMultipleProductsToCart(count: number) {
    for (let i = 0; i < count && i < await this.productCards.count(); i++) {
      await this.addProductToCartByIndex(i);
      await this.page.waitForTimeout(500); // Small delay between additions
    }
  }

  // Cart interactions
  async getCartCount(): Promise<number> {
    const countText = await this.cartCount.textContent();
    return countText ? parseInt(countText) : 0;
  }

  async expectCartCount(expectedCount: number) {
    await expect(this.cartCount).toHaveText(expectedCount.toString());
  }

  async clickCartIcon() {
    await this.cartIcon.click();
  }

  async clickCheckout() {
    await this.checkoutButton.click();
  }

  async clickContinueShopping() {
    await this.continueShoppingButton.click();
  }

  // Search and filter
  async searchProducts(query: string) {
    await this.searchInput.fill(query);
    await this.page.keyboard.press('Enter');
  }

  async filterByCategory(category: string) {
    await this.filterDropdown.selectOption(category);
  }

  async sortBy(sortOption: string) {
    await this.sortDropdown.selectOption(sortOption);
  }

  // Product details
  async viewProductDetails(index: number = 0) {
    const productCard = this.productCards.nth(index);
    const viewButton = productCard.locator(this.viewDetailsButton);
    await viewButton.click();
  }

  // Utility methods
  async getProductCount(): Promise<number> {
    return await this.productCards.count();
  }

  async waitForProductsToLoad() {
    await this.page.waitForLoadState('networkidle');
    await expect(this.productCards.first()).toBeVisible();
  }

  async takeProductScreenshot(name: string) {
    await this.page.screenshot({ 
      path: `test-results/screenshots/products-${name}.png`,
      fullPage: true 
    });
  }

  // Purchase flow
  async completePurchaseFlow() {
    // 1. Add first product to cart
    await this.addFirstProductToCart();
    
    // 2. Verify cart count increased
    await this.expectCartCount(1);
    
    // 3. Click cart icon
    await this.clickCartIcon();
    
    // 4. Proceed to checkout
    await this.clickCheckout();
    
    // 5. Should navigate to checkout page
    await expect(this.page).not.toHaveURL('/products');
  }

  // Validation methods
  async expectProductCardStructure() {
    const firstCard = this.productCards.first();
    
    // Check if product card has required elements
    await expect(firstCard.locator(this.productTitle)).toBeVisible();
    await expect(firstCard.locator(this.productPrice)).toBeVisible();
    await expect(firstCard.locator(this.addToCartButtons)).toBeVisible();
  }

  async expectSearchFunctionality() {
    await expect(this.searchInput).toBeVisible();
    await expect(this.searchInput).toBeEnabled();
  }

  async expectFilterFunctionality() {
    await expect(this.filterDropdown).toBeVisible();
    await expect(this.sortDropdown).toBeVisible();
  }

  // Error handling
  async expectNoProductsMessage() {
    await expect(this.page.locator('text=No products found')).toBeVisible();
  }

  async expectLoadingState() {
    await expect(this.page.locator('.loading, .spinner, [data-testid="loading"]')).toBeVisible();
  }

  // Performance testing
  async measurePageLoadTime(): Promise<number> {
    const startTime = Date.now();
    await this.goto();
    await this.waitForProductsToLoad();
    return Date.now() - startTime;
  }

  // Accessibility testing
  async testKeyboardNavigation() {
    // Test Tab navigation through products
    await this.page.keyboard.press('Tab');
    await expect(this.firstProductCard).toBeFocused();
    
    // Test Enter key on product card
    await this.page.keyboard.press('Enter');
    // Should open product details or add to cart
  }

  // Mobile testing
  async setMobileViewport() {
    await this.page.setViewportSize({ width: 375, height: 667 });
  }

  async expectMobileLayout() {
    await this.setMobileViewport();
    await expect(this.productCards).toBeVisible();
    await expect(this.cartIcon).toBeVisible();
  }
} 