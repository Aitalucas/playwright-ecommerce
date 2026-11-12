import { Locator, Page } from '@playwright/test';

export interface SignupData {
  name: string;
  email: string;
  password: string;
  title?: 'Mr' | 'Mrs';
  birthDay?: string;   // e.g. '10'
  birthMonth?: string; // e.g. 'May'
  birthYear?: string;  // e.g. '1990'
  firstName: string;
  lastName: string;
  company?: string;
  address: string;
  address2?: string;
  country?: string;    // e.g. 'Canada'
  state: string;
  city: string;
  zipcode: string;
  mobileNumber: string;
}

export class SignupPage {
  private readonly page: Page;

  // Step 1: name + email (/login page)
  private readonly signupNameInput: Locator;
  private readonly signupEmailInput: Locator;
  private readonly signupButton: Locator;
  private readonly errorMessage: Locator;

  // Step 2: account information (/signup page)
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

  // Step 3: confirmation
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
   * Navigates to the login/signup page using the baseURL from the config
   */
  async visit(): Promise<void> {
    await this.page.goto('/login');
  }

  /**
   * Step 1: fills in name and email, then moves on to the full signup form
   */
  async startSignup(name: string, email: string): Promise<void> {
    await this.signupNameInput.fill(name);
    await this.signupEmailInput.fill(email);
    await this.signupButton.click();
  }

  /**
   * Step 2: fills in the "Enter Account Information" form and submits it
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
   * Full signup flow: step 1 + step 2 + continue after the account is created
   */
  async signup(data: SignupData): Promise<void> {
    await this.startSignup(data.name, data.email);
    await this.fillAccountInformation(data);
    await this.accountCreatedTitle.waitFor({ state: 'visible' });
    await this.continueButton.click();
  }

  /**
   * Returns true if the "ACCOUNT CREATED!" message is visible
   */
  async isAccountCreated(): Promise<boolean> {
    return await this.accountCreatedTitle.isVisible();
  }

  /**
   * Captures the error text (e.g. email already registered)
   */
  async getErrorMessageText(): Promise<string | null> {
    return await this.errorMessage.textContent();
  }
}