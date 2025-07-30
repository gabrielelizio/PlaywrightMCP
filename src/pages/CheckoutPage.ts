import { Page, Locator, expect } from '@playwright/test';

export class CheckoutPage {
  readonly page: Page;
  readonly cartItems: Locator;
  readonly itemQuantity: Locator;
  readonly itemPrice: Locator;
  readonly itemTotal: Locator;
  readonly subtotal: Locator;
  readonly tax: Locator;
  readonly shipping: Locator;
  readonly total: Locator;
  readonly checkoutForm: Locator;
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly emailInput: Locator;
  readonly phoneInput: Locator;
  readonly addressInput: Locator;
  readonly cityInput: Locator;
  readonly stateInput: Locator;
  readonly zipCodeInput: Locator;
  readonly countrySelect: Locator;
  readonly paymentMethod: Locator;
  readonly cardNumberInput: Locator;
  readonly expiryInput: Locator;
  readonly cvvInput: Locator;
  readonly cardNameInput: Locator;
  readonly placeOrderButton: Locator;
  readonly cancelButton: Locator;
  readonly backToCartButton: Locator;
  readonly orderSummary: Locator;
  readonly promoCodeInput: Locator;
  readonly applyPromoButton: Locator;

  constructor(page: Page) {
    this.page = page;
    
    // Cart items
    this.cartItems = page.locator('[data-testid="cart-item"], .cart-item, .item');
    this.itemQuantity = page.locator('[data-testid="quantity"], .quantity, input[type="number"]');
    this.itemPrice = page.locator('[data-testid="item-price"], .item-price, .price');
    this.itemTotal = page.locator('[data-testid="item-total"], .item-total, .total');
    
    // Order summary
    this.orderSummary = page.locator('[data-testid="order-summary"], .order-summary, .summary');
    this.subtotal = page.locator('[data-testid="subtotal"], .subtotal');
    this.tax = page.locator('[data-testid="tax"], .tax');
    this.shipping = page.locator('[data-testid="shipping"], .shipping');
    this.total = page.locator('[data-testid="total"], .total');
    
    // Checkout form
    this.checkoutForm = page.locator('[data-testid="checkout-form"], .checkout-form, form');
    this.firstNameInput = page.locator('[data-testid="first-name"], input[name="firstName"], input[name="first_name"]');
    this.lastNameInput = page.locator('[data-testid="last-name"], input[name="lastName"], input[name="last_name"]');
    this.emailInput = page.locator('[data-testid="email"], input[name="email"], input[type="email"]');
    this.phoneInput = page.locator('[data-testid="phone"], input[name="phone"], input[type="tel"]');
    this.addressInput = page.locator('[data-testid="address"], input[name="address"], textarea[name="address"]');
    this.cityInput = page.locator('[data-testid="city"], input[name="city"]');
    this.stateInput = page.locator('[data-testid="state"], input[name="state"], select[name="state"]');
    this.zipCodeInput = page.locator('[data-testid="zip"], input[name="zipCode"], input[name="zip"]');
    this.countrySelect = page.locator('[data-testid="country"], select[name="country"]');
    
    // Payment
    this.paymentMethod = page.locator('[data-testid="payment-method"], .payment-method');
    this.cardNumberInput = page.locator('[data-testid="card-number"], input[name="cardNumber"], input[name="card_number"]');
    this.expiryInput = page.locator('[data-testid="expiry"], input[name="expiry"], input[name="expiryDate"]');
    this.cvvInput = page.locator('[data-testid="cvv"], input[name="cvv"], input[name="cvvCode"]');
    this.cardNameInput = page.locator('[data-testid="card-name"], input[name="cardName"], input[name="card_holder"]');
    
    // Buttons
    this.placeOrderButton = page.locator('[data-testid="place-order"], .place-order, button:has-text("Place Order")');
    this.cancelButton = page.locator('[data-testid="cancel"], .cancel, button:has-text("Cancel")');
    this.backToCartButton = page.locator('[data-testid="back-to-cart"], .back-to-cart, button:has-text("Back to Cart")');
    
    // Promo code
    this.promoCodeInput = page.locator('[data-testid="promo-code"], input[name="promoCode"], input[placeholder*="promo"]');
    this.applyPromoButton = page.locator('[data-testid="apply-promo"], .apply-promo, button:has-text("Apply")');
  }

  // Navigation
  async goto() {
    await this.page.goto('/checkout');
  }

  // Page validation
  async expectPageLoaded() {
    await expect(this.page).toHaveTitle(/Checkout|Order|Payment/);
    await expect(this.checkoutForm).toBeVisible();
  }

  async expectCartItemsVisible() {
    await expect(this.cartItems).toHaveCount(1, { minimum: true });
  }

  // Form interactions
  async fillShippingInfo(data: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  }) {
    await this.firstNameInput.fill(data.firstName);
    await this.lastNameInput.fill(data.lastName);
    await this.emailInput.fill(data.email);
    await this.phoneInput.fill(data.phone);
    await this.addressInput.fill(data.address);
    await this.cityInput.fill(data.city);
    await this.stateInput.fill(data.state);
    await this.zipCodeInput.fill(data.zipCode);
    await this.countrySelect.selectOption(data.country);
  }

  async fillPaymentInfo(data: {
    cardNumber: string;
    expiry: string;
    cvv: string;
    cardName: string;
  }) {
    await this.cardNumberInput.fill(data.cardNumber);
    await this.expiryInput.fill(data.expiry);
    await this.cvvInput.fill(data.cvv);
    await this.cardNameInput.fill(data.cardName);
  }

  // Cart interactions
  async updateItemQuantity(index: number, quantity: number) {
    const quantityInput = this.cartItems.nth(index).locator(this.itemQuantity);
    await quantityInput.fill(quantity.toString());
  }

  async removeItem(index: number) {
    const removeButton = this.cartItems.nth(index).locator('button:has-text("Remove"), .remove');
    await removeButton.click();
  }

  async getItemCount(): Promise<number> {
    return await this.cartItems.count();
  }

  async getItemInfo(index: number = 0) {
    const item = this.cartItems.nth(index);
    const title = await item.locator('h3, h4, .title').textContent() || '';
    const price = await item.locator(this.itemPrice).textContent() || '';
    const quantity = await item.locator(this.itemQuantity).inputValue() || '1';
    
    return { title, price, quantity };
  }

  // Order summary
  async getOrderSummary() {
    const subtotal = await this.subtotal.textContent() || '';
    const tax = await this.tax.textContent() || '';
    const shipping = await this.shipping.textContent() || '';
    const total = await this.total.textContent() || '';
    
    return { subtotal, tax, shipping, total };
  }

  async expectOrderSummaryVisible() {
    await expect(this.orderSummary).toBeVisible();
    await expect(this.subtotal).toBeVisible();
    await expect(this.total).toBeVisible();
  }

  // Promo code
  async applyPromoCode(code: string) {
    await this.promoCodeInput.fill(code);
    await this.applyPromoButton.click();
  }

  async expectPromoApplied() {
    await expect(this.page.locator('.promo-applied, .discount')).toBeVisible();
  }

  // Payment validation
  async expectPaymentFormVisible() {
    await expect(this.paymentMethod).toBeVisible();
    await expect(this.cardNumberInput).toBeVisible();
    await expect(this.expiryInput).toBeVisible();
    await expect(this.cvvInput).toBeVisible();
  }

  // Order placement
  async placeOrder() {
    await this.placeOrderButton.click();
  }

  async expectOrderPlaced() {
    // Should navigate to confirmation page
    await expect(this.page).not.toHaveURL('/checkout');
    await expect(this.page.locator('text=Order Confirmed, text=Thank you, text=Order Placed')).toBeVisible();
  }

  // Navigation
  async cancelOrder() {
    await this.cancelButton.click();
  }

  async backToCart() {
    await this.backToCartButton.click();
  }

  // Validation methods
  async expectFormValidation() {
    // Try to place order without filling form
    await this.placeOrderButton.click();
    
    // Should show validation errors
    await expect(this.page.locator('.error, .validation-error, [data-testid="error"]')).toBeVisible();
  }

  async expectRequiredFields() {
    await expect(this.firstNameInput).toBeVisible();
    await expect(this.lastNameInput).toBeVisible();
    await expect(this.emailInput).toBeVisible();
    await expect(this.addressInput).toBeVisible();
    await expect(this.cardNumberInput).toBeVisible();
  }

  // Error handling
  async expectPaymentError() {
    await expect(this.page.locator('.payment-error, .card-error')).toBeVisible();
  }

  async expectShippingError() {
    await expect(this.page.locator('.shipping-error, .address-error')).toBeVisible();
  }

  // Utility methods
  async takeCheckoutScreenshot(name: string) {
    await this.page.screenshot({ 
      path: `test-results/screenshots/checkout-${name}.png`,
      fullPage: true 
    });
  }

  async waitForCheckoutLoad() {
    await this.page.waitForLoadState('networkidle');
    await expect(this.checkoutForm).toBeVisible();
  }

  // Complete checkout flow
  async completeCheckoutFlow(customerData: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    cardNumber: string;
    expiry: string;
    cvv: string;
    cardName: string;
  }) {
    // 1. Fill shipping information
    await this.fillShippingInfo({
      firstName: customerData.firstName,
      lastName: customerData.lastName,
      email: customerData.email,
      phone: customerData.phone,
      address: customerData.address,
      city: customerData.city,
      state: customerData.state,
      zipCode: customerData.zipCode,
      country: customerData.country
    });

    // 2. Fill payment information
    await this.fillPaymentInfo({
      cardNumber: customerData.cardNumber,
      expiry: customerData.expiry,
      cvv: customerData.cvv,
      cardName: customerData.cardName
    });

    // 3. Place order
    await this.placeOrder();

    // 4. Verify order placed
    await this.expectOrderPlaced();
  }

  // Performance testing
  async measureCheckoutLoadTime(): Promise<number> {
    const startTime = Date.now();
    await this.goto();
    await this.waitForCheckoutLoad();
    return Date.now() - startTime;
  }

  // Accessibility testing
  async testKeyboardNavigation() {
    // Test Tab navigation through form
    await this.page.keyboard.press('Tab');
    await expect(this.firstNameInput).toBeFocused();
    
    // Test form submission with Enter
    await this.page.keyboard.press('Tab');
    await this.page.keyboard.press('Tab');
    await this.page.keyboard.press('Tab');
    await this.page.keyboard.press('Enter');
  }

  // Mobile testing
  async setMobileViewport() {
    await this.page.setViewportSize({ width: 375, height: 667 });
  }

  async expectMobileLayout() {
    await this.setMobileViewport();
    await expect(this.checkoutForm).toBeVisible();
    await expect(this.placeOrderButton).toBeVisible();
  }
} 