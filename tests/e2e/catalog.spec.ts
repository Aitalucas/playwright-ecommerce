// Import the custom 'test' fixture instead of the native Playwright one
import { test, expect } from '../../fixtures/basePage';

test.describe('E-Commerce Catalog - Authenticated Features', () => {

  test('should allow authenticated user to add a product to the cart', async ({ authenticatedPage }) => {
    // The browser opens already logged in! Just navigate straight to the product page (Blue Top)
    await authenticatedPage.goto('/product_details/1');

    // Confirm we are on the right page before acting
    await expect(authenticatedPage.getByRole('heading', { name: 'Blue Top' })).toBeVisible();

    // Perform the test action (the site has no wishlist; the cart is the equivalent)
    await authenticatedPage.getByRole('button', { name: 'Add to cart' }).click();

    // Validate the success modal
    await expect(authenticatedPage.getByText('Added!')).toBeVisible();
    await expect(authenticatedPage.getByText('Your product has been added to cart.')).toBeVisible();

    // Open the cart and confirm the product is there
    await authenticatedPage.getByRole('link', { name: 'View Cart' }).click();
    await expect(authenticatedPage).toHaveURL(/\/view_cart/);
    await expect(authenticatedPage.getByRole('link', { name: 'Blue Top' })).toBeVisible();
  });
});