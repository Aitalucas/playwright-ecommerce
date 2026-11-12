import { Locator, Page } from '@playwright/test';

export class LoginPage {
  private readonly page: Page;
  private readonly emailInput: Locator;
  private readonly passwordInput: Locator;
  private readonly loginButton: Locator;
  private readonly errorMessage: Locator;
  private readonly loggedInAs: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.locator('[data-qa="login-email"]');
    this.passwordInput = page.locator('[data-qa="login-password"]');
    this.loginButton = page.locator('[data-qa="login-button"]');
    this.errorMessage = page.getByText('Your email or password is incorrect!');
    this.loggedInAs = page.getByText(/Logged in as/i);
  }

  /**
   * Navigates to the login/signup page (baseURL: https://automationexercise.com)
   */
  async visit(): Promise<void> {
    await this.page.goto('/login');
  }

  /**
   * Runs the full authentication flow
   */
  async login(email: string, password: string): Promise<void> {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  /**
   * Returns true if "Logged in as <name>" is visible in the header
   */
  async isLoggedIn(): Promise<boolean> {
    return await this.loggedInAs.isVisible();
  }

  /**
   * Returns true if the site displayed an invalid credentials error
   */
  async hasLoginError(): Promise<boolean> {
    return await this.errorMessage.isVisible();
  }

  /**
   * Captures the error text when the credentials are invalid
   */
  async getErrorMessageText(): Promise<string | null> {
    return await this.errorMessage.textContent();
  }
}