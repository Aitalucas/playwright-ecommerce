// Importe o seu 'test' customizado e não o nativo
import { test, expect } from '../../fixtures/basePage';

test.describe('E-Commerce Catalog - Authenticated Features', () => {

  test('should allow authenticated user to add a product to the cart', async ({ authenticatedPage }) => {
    // O browser já abre logado! Basta navegar direto para a página do produto (Blue Top)
    await authenticatedPage.goto('/product_details/1');

    // Confirma que estamos na página certa antes de agir
    await expect(authenticatedPage.getByRole('heading', { name: 'Blue Top' })).toBeVisible();

    // Executa a ação do teste (o site não tem wishlist; o equivalente é o carrinho)
    await authenticatedPage.getByRole('button', { name: 'Add to cart' }).click();

    // Valida o modal de sucesso
    await expect(authenticatedPage.getByText('Added!')).toBeVisible();
    await expect(authenticatedPage.getByText('Your product has been added to cart.')).toBeVisible();

    // Abre o carrinho e confirma que o produto está lá
    await authenticatedPage.getByRole('link', { name: 'View Cart' }).click();
    await expect(authenticatedPage).toHaveURL(/\/view_cart/);
    await expect(authenticatedPage.getByRole('link', { name: 'Blue Top' })).toBeVisible();
  });
});