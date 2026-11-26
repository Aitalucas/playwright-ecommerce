# Playwright E-commerce Test Automation

End-to-end tests written with **Playwright** and **TypeScript** against [Automation Exercise](https://automationexercise.com/), a public website for automation practice. This is a personal portfolio project.

## What is covered

| File | What it does |
| --- | --- |
| `tests/auth/global.setup.ts` | Logs in (or signs up if the login is rejected) and saves the session to `.auth/user.json` |
| `tests/e2e/catalog.spec.ts` | Adds a product to the cart as a logged-in user and checks that it appears in the cart |
| `tests/e2e/checkout.spec.ts` | Goes through checkout, mocks an HTTP 500 on the payment request and checks that the order is not confirmed |

## Techniques used

- **Reusable authenticated session:** a setup project saves the `storageState`, so the tests do not repeat the UI login.
- **Custom fixture:** `authenticatedPage` opens an isolated browser context with the saved session and closes it after the test.
- **Page Object Model:** `LoginPage` and `SignupPage` are used by the authentication setup.
- **Network interception:** `page.route` mocks the payment error and blocks ad requests in the checkout test.
- **CI with sharding:** GitHub Actions splits the run into 3 parallel shards and merges the blob reports into one HTML report.

Tests run on Chromium (Desktop Chrome).

## Project structure

```text
.github/workflows/playwright.yml   CI pipeline
fixtures/basePage.ts               authenticatedPage fixture
page-objects/
  CartPage.ts                      Cart actions (not used by the tests yet)
  LoginPage.ts                     Login page
  SignupPage.ts                    Signup flow
tests/
  auth/global.setup.ts             Authentication setup
  e2e/catalog.spec.ts              Add to cart
  e2e/checkout.spec.ts             Payment error handling
playwright.config.ts               Projects, base URL and reporters
```

## Running locally

Requirements: [Node.js](https://nodejs.org) 20 or later.

```bash
git clone https://github.com/Aitalucas/playwright-ecommerce.git
cd playwright-ecommerce
npm ci
npx playwright install --with-deps chromium
```

Create the file `.auth/user.env` with a test account. If the account does not exist, the setup creates it.

```env
USER_EMAIL=your-test-email@example.com
USER_PASSWORD=your-test-password
```

The `.auth/` folder is ignored by Git. Use test-only credentials.

Run the tests:

```bash
npx playwright test          # headless
npx playwright test --ui     # UI mode
npx playwright show-report   # open the last HTML report
```

## Continuous integration

The workflow runs on pushes and pull requests to `main` or `master`.

1. Add the repository secrets `USER_EMAIL` and `USER_PASSWORD`.
2. Each of the 3 shards installs the dependencies, runs its part of the tests and uploads a blob report.
3. A final job merges the reports and uploads `final-playwright-report`, kept for 7 days.

## Next steps

- Tests for invalid login, product search and removing items from the cart
- Use `CartPage` in the cart and checkout tests
- API tests with Playwright's `request` fixture
- Screenshots and traces on failure

## Author

**Lucas Bittencourt**, QA Automation Engineer

- [LinkedIn](https://linkedin.com/in/lucas-teixeira-aita-bittencourt/)
- [aita.lucas@hotmail.com](mailto:aita.lucas@hotmail.com)