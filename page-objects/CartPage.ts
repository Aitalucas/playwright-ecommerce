import { Locator, Page } from '@playwright/test';

export class CartPage {
  private readonly page: Page;
  private readonly cartItems: Locator;
  private readonly checkoutButton: Locator;
  private readonly continueShoppingButton: Locator;

  constructor(page: Page) {
    this.page = page;
    // Seletores reais mapeados do DOM do Saucedemo
    this.cartItems = page.locator('[data-test="inventory-item"]');
    this.checkoutButton = page.locator('[data-test="checkout"]');
    this.continueShoppingButton = page.locator('[data-test="continue-shopping"]');
  }

  /**
   * Navega diretamente para a URL do carrinho
   */
  async visit(): Promise<void> {
    await this.page.goto('/cart.html');
  }

  /**
   * Retorna a quantidade de produtos adicionados dentro do container do carrinho
   */
  async getCartItemsCount(): Promise<number> {
    return await this.cartItems.count();
  }

  /**
   * Filtra e isola a linha de um produto específico com base no seu nome visível
   */
  getCartItemByName(productName: string): Locator {
    return this.cartItems.filter({ hasText: productName });
  }

  /**
   * Remove um item específico do carrinho localizando seu botão de remoção dedicado
   */
  async removeItemFromCart(productName: string): Promise<void> {
    const item = this.getCartItemByName(productName);
    // O Saucedemo usa botões com a classe ou texto 'Remove'
    await item.getByRole('button', { name: 'Remove' }).click();
  }

  /**
   * Avança para a primeira etapa do fluxo de Checkout
   */
  async proceedToCheckout(): Promise<void> {
    await this.checkoutButton.click();
  }
}

