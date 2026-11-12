import { test as base, Page } from '@playwright/test';
import path from 'path';

// 1. Define the type for your custom fixture
type MyFixtures = {
  authenticatedPage: Page;
};

// 2. Extend Playwright's base `test` object
export const test = base.extend<MyFixtures>({
  authenticatedPage: async ({ browser }, use) => {
    // Path to the storage state file (cookies/session tokens) saved by the global setup
    const authFile = path.resolve(__dirname, '../.auth/user.json');

    // Create an isolated browser context pre-loaded with the authenticated state
    const context = await browser.newContext({
      storageState: authFile,
    });

    const page = await context.newPage();

    // Hand the already-authenticated page over to the test
    await use(page);

    // Teardown: close the context once the test finishes
    await context.close();
  },
});

// Re-export Playwright's native `expect` so tests only need a single import
export { expect } from '@playwright/test';