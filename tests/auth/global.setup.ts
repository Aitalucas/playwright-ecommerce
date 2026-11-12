import { test as setup, expect } from '@playwright/test';
import { LoginPage } from '../../page-objects/LoginPage';
import { SignupPage } from '../../page-objects/SignupPage';

const authFile = '.auth/user.json';

setup('authenticate', async ({ page }) => {
  const email = process.env.USER_EMAIL;
  const password = process.env.USER_PASSWORD;
  if (!email || !password) {
    throw new Error('USER_EMAIL / USER_PASSWORD were not loaded from .auth/user.env');
  }

  const loginPage = new LoginPage(page);
  await loginPage.visit();
  await loginPage.login(email, password);

  const loggedIn = page.getByText(/Logged in as/i);
  const loginError = page.getByText('Your email or password is incorrect!');
  await expect(loggedIn.or(loginError)).toBeVisible();

  // Account does not exist yet: sign up (the site logs the user in automatically at the end)
  if (await loginError.isVisible()) {
    const signupPage = new SignupPage(page);
    await signupPage.visit();
    await signupPage.signup({
      name: 'QA Tester',
      email,
      password,
      firstName: 'QA',
      lastName: 'Tester',
      address: '123 Main Street',
      country: 'Canada',
      state: 'Ontario',
      city: 'Toronto',
      zipcode: 'M5V 2T6',
      mobileNumber: '4165550123',
    });
  }

  await expect(loggedIn).toBeVisible();
  // Persist the authenticated session so tests can reuse it via the authenticatedPage fixture
  await page.context().storageState({ path: authFile });
});