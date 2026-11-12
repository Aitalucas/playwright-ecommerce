// Importa a sua fixture customizada que já abre o browser logado
import { test, expect } from '../../fixtures/basePage';

test.describe('E-Commerce Checkout - Resiliency & Error Handling', () => {

  test('should not confirm the order when the payment request fails (HTTP 500)', async ({ authenticatedPage }) => {
    // 0. Bloqueia anúncios do site (Google Ads / vignette), que cobrem a tela e travam o carregamento
    await authenticatedPage.route(
      /googlesyndication|doubleclick|googleadservices|adservice|pagead|google_vignette/,
      (route) => route.abort(),
    );

    // 1. Intercepta SOMENTE o envio do formulário de pagamento (POST /payment).
    // O GET em /payment (a tela do formulário) precisa passar normalmente.
    await authenticatedPage.route('**/payment', async (route) => {
      if (route.request().method() !== 'POST') {
        await route.continue();
        return;
      }
      // Força o servidor a responder com erro 500
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          error: 'Internal Server Error',
          message: 'Database connection failed unexpectedly.',
        }),
      });
    });

    // 2. Monta o carrinho (o carrinho precisa ter um produto para chegar ao checkout)
    // 'domcontentloaded' evita esperar os anúncios terminarem de carregar
    await authenticatedPage.goto('/product_details/1', { waitUntil: 'domcontentloaded' });

    // Confirma que a página do produto realmente abriu (se falhar aqui, o problema é a página, não o botão)
    await expect(authenticatedPage.getByRole('heading', { name: 'Blue Top' })).toBeVisible();

    await authenticatedPage.getByRole('button', { name: /add to cart/i }).click();
    await authenticatedPage.getByRole('link', { name: 'View Cart' }).click();
    await expect(authenticatedPage).toHaveURL(/\/view_cart/);

    // 3. Avança para o checkout
    await authenticatedPage.getByText('Proceed To Checkout').click();
    await expect(authenticatedPage).toHaveURL(/\/checkout/);

    // Comentário opcional do pedido + avanço para o pagamento
    await authenticatedPage.locator('textarea[name="message"]').fill('Pedido de teste de resiliência');
    await authenticatedPage.getByRole('link', { name: 'Place Order' }).click();
    await expect(authenticatedPage).toHaveURL(/\/payment$/);

    // 4. Preenche os dados do cartão (dados fictícios)
    await authenticatedPage.locator('[data-qa="name-on-card"]').fill('Alex Tester');
    await authenticatedPage.locator('[data-qa="card-number"]').fill('4111111111111111');
    await authenticatedPage.locator('[data-qa="cvc"]').fill('123');
    await authenticatedPage.locator('[data-qa="expiry-month"]').fill('12');
    await authenticatedPage.locator('[data-qa="expiry-year"]').fill('2030');

    // 5. O momento do disparo: envia o formulário, que cai no POST mockado
    await authenticatedPage.locator('[data-qa="pay-button"]').click();

    // 6. Asserções de resiliência
    // O site é renderizado no servidor e não tem tela amigável para erro 500,
    // então validamos o que importa: o pedido NÃO pode ser confirmado.
    await expect(authenticatedPage).not.toHaveURL(/\/payment_done/);
    await expect(authenticatedPage.getByText('Order Placed!')).toHaveCount(0);
  });
});