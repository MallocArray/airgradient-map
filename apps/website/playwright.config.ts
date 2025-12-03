import { PlaywrightTestConfig } from '@playwright/test';

const config: PlaywrightTestConfig = {
  testDir: './tests/e2e',
  timeout: 120000,
  expect: { timeout: 10000 },
  fullyParallel: false,
  reporter: [["list"]],
  use: {
    browserName: 'chromium',
    headless: true,
    baseURL: 'http://0.0.0.0:3000',
    viewport: { width: 1280, height: 800 },
    actionTimeout: 20000,
    navigationTimeout: 30000
  }
};

export default config;
