import { defineConfig, devices } from '@playwright/test';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '.auth/user.env') });

const BASE_URL = 'https://automationexercise.com/';

export default defineConfig({
  testDir: './tests',
  reporter: process.env.CI ? 'blob' : [['html', { open: 'never' }]],
  use: {
    baseURL: BASE_URL,
  },
  projects: [
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
    },
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: '.auth/user.json',
      },
      dependencies: ['setup'],
    },
  ],
});