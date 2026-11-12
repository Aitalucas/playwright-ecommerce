// Imports the custom fixture that already opens the browser logged in
import { test, expect } from '../../fixtures/basePage';

test.describe('E-Commerce Checkout - Resiliency & Error Handling', () => {

  test('should not confirm the order when the payment request fails (HTTP 500)', async ({ authenticatedPage }) => {
    // 0. Block the site's ads (Google Ads / vignette), which cover the screen and stall page loading
    await authenticatedPage.route(
      /googlesyndication|doubleclick|googleadservices|adservice|pagead|google_vignette/,
      (route) => route.abort(),
    );

    // 1. Intercept ONLY the payment form submission (POST /payment).
    // The GET on /payment (the form page itself) must go through normally.
    await authenticatedPage.route('**/payment', async (route) => {
      if (route.request().method() !== 'POST') {
        await route.continue();
        return;
      }
      // Force the server to respond with a 500 error
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          error: 'Internal Server Error',
          message: 'Database connection failed unexpectedly.',
        }),
      });
    });

    // 2. Build the cart (the cart needs at least one product to reach checkout)
    // 'domcontentloaded' avoids waiting for the ads to finish loading
    await authenticatedPage.goto('/product_details/1', { waitUntil: 'domcontentloaded' });

    // Confirm the product page actually opened (if this fails, the problem is the page, not the button)
    await expect(authenticatedPage.getByRole('heading', { name: 'Blue Top' })).toBeVisible();

    await authenticatedPage.getByRole('button', { name: /add to cart/i }).click();
    await authenticatedPage.getByRole('link', { name: 'View Cart' }).click();
    await expect(authenticatedPage).toHaveURL(/\/view_cart/);

    // 3. Proceed to checkout
    await authenticatedPage.getByText('Proceed To Checkout').click();
    await expect(authenticatedPage).toHaveURL(/\/checkout/);

    // Optional order comment + move on to payment
    await authenticatedPage.locator('textarea[name="message"]').fill('Resiliency test order');
    await authenticatedPage.getByRole('link', { name: 'Place Order' }).click();
    await expect(authenticatedPage).toHaveURL(/\/payment$/);

    // 4. Fill in the card details (fake test data)
    await authenticatedPage.locator('[data-qa="name-on-card"]').fill('Alex Tester');
    await authenticatedPage.locator('[data-qa="card-number"]').fill('4111111111111111');
    await authenticatedPage.locator('[data-qa="cvc"]').fill('123');
    await authenticatedPage.locator('[data-qa="expiry-month"]').fill('12');
    await authenticatedPage.locator('[data-qa="expiry-year"]').fill('2030');

    // 5. The trigger moment: submit the form, which hits the mocked POST
    await authenticatedPage.locator('[data-qa="pay-button"]').click();

    // 6. Resiliency assertions
    // The site is server-side rendered and has no friendly screen for a 500 error,
    // so we validate what matters: the order must NOT be confirmed.
    await expect(authenticatedPage).not.toHaveURL(/\/payment_done/);
    await expect(authenticatedPage.getByText('Order Placed!')).toHaveCount(0);
  });
});