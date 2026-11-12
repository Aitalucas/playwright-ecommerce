import { Locator, Page } from '@playwright/test';

export class CartPage {
  private readonly page: Page;
  private readonly cartItems: Locator;
  private readonly checkoutButton: Locator;

  constructor(page: Page) {
    this.page = page;
    // Selectors based on the automationexercise.com cart table DOM
    this.cartItems = page.locator('#cart_info_table tbody tr');
    this.checkoutButton = page.locator('a.check_out');
  }

  /**
   * Navigates directly to the cart page URL
   */
  async visit(): Promise<void> {
    await this.page.goto('/view_cart');
  }

  /**
   * Returns the number of product rows currently in the cart table
   */
  async getCartItemsCount(): Promise<number> {
    return await this.cartItems.count();
  }

  /**
   * Filters and isolates a specific product's row based on its visible name
   */
  getCartItemByName(productName: string): Locator {
    return this.cartItems.filter({ hasText: productName });
  }

  /**
   * Removes a specific item from the cart by clicking the delete (X) icon in its row
   */
  async removeItemFromCart(productName: string): Promise<void> {
    const item = this.getCartItemByName(productName);
    // automationexercise.com renders removal as an icon link with the class 'cart_quantity_delete'
    await item.locator('.cart_quantity_delete').click();
  }

  /**
   * Proceeds to the first step of the Checkout flow
   */
  async proceedToCheckout(): Promise<void> {
    await this.checkoutButton.click();
  }
}