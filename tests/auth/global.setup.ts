import { test as setup, expect } from '@playwright/test';
import { LoginPage } from '../../page-objects/LoginPage';
import { SignupPage } from '../../page-objects/SignupPage';

const authFile = '.auth/user.json';

setup('authenticate', async ({ page }) => {
  const email = process.env.USER_EMAIL;
  const password = process.env.USER_PASSWORD;
  if (!email || !password) {
    throw new Error('USER_EMAIL / USER_PASSWORD não foram carregados de .auth/user.env');
  }

  const loginPage = new LoginPage(page);
  await loginPage.visit();
  await loginPage.login(email, password);

  const loggedIn = page.getByText(/Logged in as/i);
  const loginError = page.getByText('Your email or password is incorrect!');
  await expect(loggedIn.or(loginError)).toBeVisible();

  // Conta ainda não existe: cadastra (o site já deixa logado ao final)
  if (await loginError.isVisible()) {
    const signupPage = new SignupPage(page);
    await signupPage.visit();
    await signupPage.signup({
      name: 'Teste QA',
      email,
      password,
      firstName: 'Teste',
      lastName: 'QA',
      address: 'Rua A, 100',
      state: 'SC',
      city: 'Manopolis',
      zipcode: '88000000',
      mobileNumber: '48999999999',
    });
  }

  await expect(loggedIn).toBeVisible();
  await page.context().storageState({ path: authFile });
});