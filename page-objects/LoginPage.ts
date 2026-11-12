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
   * Navega para a página de login/cadastro (baseURL: https://automationexercise.com)
   */
  async visit(): Promise<void> {
    await this.page.goto('/login');
  }

  /**
   * Executa o fluxo completo de autenticação
   */
  async login(email: string, password: string): Promise<void> {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  /**
   * Retorna true se "Logged in as <nome>" estiver visível no header
   */
  async isLoggedIn(): Promise<boolean> {
    return await this.loggedInAs.isVisible();
  }

  /**
   * Retorna true se o site mostrou erro de credenciais inválidas
   */
  async hasLoginError(): Promise<boolean> {
    return await this.errorMessage.isVisible();
  }

  /**
   * Captura o texto de erro caso as credenciais sejam inválidas
   */
  async getErrorMessageText(): Promise<string | null> {
    return await this.errorMessage.textContent();
  }
}