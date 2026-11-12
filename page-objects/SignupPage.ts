import { Locator, Page } from '@playwright/test';

export interface SignupData {
  name: string;
  email: string;
  password: string;
  title?: 'Mr' | 'Mrs';
  birthDay?: string;   // ex: '10'
  birthMonth?: string; // ex: 'May'
  birthYear?: string;  // ex: '1990'
  firstName: string;
  lastName: string;
  company?: string;
  address: string;
  address2?: string;
  country?: string;    // ex: 'Canada'
  state: string;
  city: string;
  zipcode: string;
  mobileNumber: string;
}

export class SignupPage {
  private readonly page: Page;

  // Etapa 1: nome + email (página /login)
  private readonly signupNameInput: Locator;
  private readonly signupEmailInput: Locator;
  private readonly signupButton: Locator;
  private readonly errorMessage: Locator;

  // Etapa 2: informações da conta (página /signup)
  private readonly titleMr: Locator;
  private readonly titleMrs: Locator;
  private readonly passwordInput: Locator;
  private readonly daySelect: Locator;
  private readonly monthSelect: Locator;
  private readonly yearSelect: Locator;
  private readonly newsletterCheckbox: Locator;
  private readonly offersCheckbox: Locator;
  private readonly firstNameInput: Locator;
  private readonly lastNameInput: Locator;
  private readonly companyInput: Locator;
  private readonly addressInput: Locator;
  private readonly address2Input: Locator;
  private readonly countrySelect: Locator;
  private readonly stateInput: Locator;
  private readonly cityInput: Locator;
  private readonly zipcodeInput: Locator;
  private readonly mobileInput: Locator;
  private readonly createAccountButton: Locator;

  // Etapa 3: confirmação
  private readonly accountCreatedTitle: Locator;
  private readonly continueButton: Locator;

  constructor(page: Page) {
    this.page = page;

    this.signupNameInput = page.locator('[data-qa="signup-name"]');
    this.signupEmailInput = page.locator('[data-qa="signup-email"]');
    this.signupButton = page.locator('[data-qa="signup-button"]');
    this.errorMessage = page.getByText('Email Address already exist!');

    this.titleMr = page.locator('#id_gender1');
    this.titleMrs = page.locator('#id_gender2');
    this.passwordInput = page.locator('[data-qa="password"]');
    this.daySelect = page.locator('[data-qa="days"]');
    this.monthSelect = page.locator('[data-qa="months"]');
    this.yearSelect = page.locator('[data-qa="years"]');
    this.newsletterCheckbox = page.locator('#newsletter');
    this.offersCheckbox = page.locator('#optin');
    this.firstNameInput = page.locator('[data-qa="first_name"]');
    this.lastNameInput = page.locator('[data-qa="last_name"]');
    this.companyInput = page.locator('[data-qa="company"]');
    this.addressInput = page.locator('[data-qa="address"]');
    this.address2Input = page.locator('[data-qa="address2"]');
    this.countrySelect = page.locator('[data-qa="country"]');
    this.stateInput = page.locator('[data-qa="state"]');
    this.cityInput = page.locator('[data-qa="city"]');
    this.zipcodeInput = page.locator('[data-qa="zipcode"]');
    this.mobileInput = page.locator('[data-qa="mobile_number"]');
    this.createAccountButton = page.locator('[data-qa="create-account"]');

    this.accountCreatedTitle = page.locator('[data-qa="account-created"]');
    this.continueButton = page.locator('[data-qa="continue-button"]');
  }

  /**
   * Navega para a página de login/cadastro usando a baseURL da config
   */
  async visit(): Promise<void> {
    await this.page.goto('/login');
  }

  /**
   * Etapa 1: preenche nome e email e avança para o formulário completo
   */
  async startSignup(name: string, email: string): Promise<void> {
    await this.signupNameInput.fill(name);
    await this.signupEmailInput.fill(email);
    await this.signupButton.click();
  }

  /**
   * Etapa 2: preenche o formulário "Enter Account Information" e envia
   */
  async fillAccountInformation(data: SignupData): Promise<void> {
    if (data.title === 'Mrs') {
      await this.titleMrs.check();
    } else {
      await this.titleMr.check();
    }

    await this.passwordInput.fill(data.password);

    if (data.birthDay) await this.daySelect.selectOption(data.birthDay);
    if (data.birthMonth) await this.monthSelect.selectOption({ label: data.birthMonth });
    if (data.birthYear) await this.yearSelect.selectOption(data.birthYear);

    await this.newsletterCheckbox.check();
    await this.offersCheckbox.check();

    await this.firstNameInput.fill(data.firstName);
    await this.lastNameInput.fill(data.lastName);
    if (data.company) await this.companyInput.fill(data.company);
    await this.addressInput.fill(data.address);
    if (data.address2) await this.address2Input.fill(data.address2);
    await this.countrySelect.selectOption(data.country ?? 'Canada');
    await this.stateInput.fill(data.state);
    await this.cityInput.fill(data.city);
    await this.zipcodeInput.fill(data.zipcode);
    await this.mobileInput.fill(data.mobileNumber);

    await this.createAccountButton.click();
  }

  /**
   * Fluxo completo de cadastro: etapa 1 + etapa 2 + continuar após criação
   */
  async signup(data: SignupData): Promise<void> {
    await this.startSignup(data.name, data.email);
    await this.fillAccountInformation(data);
    await this.accountCreatedTitle.waitFor({ state: 'visible' });
    await this.continueButton.click();
  }

  /**
   * Retorna true se a mensagem "ACCOUNT CREATED!" está visível
   */
  async isAccountCreated(): Promise<boolean> {
    return await this.accountCreatedTitle.isVisible();
  }

  /**
   * Captura o texto de erro (ex: email já cadastrado)
   */
  async getErrorMessageText(): Promise<string | null> {
    return await this.errorMessage.textContent();
  }
}