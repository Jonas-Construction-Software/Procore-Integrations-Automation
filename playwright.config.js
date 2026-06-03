// @ts-check
import { defineConfig } from '@playwright/test';
import { AppConfig } from './config';

const isCI = !!process.env.CI;

export default defineConfig({
  timeout: 600000,
  testDir: './tests',

  fullyParallel: true,

  forbidOnly: isCI,

  retries: isCI ? 1 : 0,

  workers: isCI ? 2 : undefined,

  outputDir: 'test-results/',

  reporter: isCI
    ? [
        ['html', { open: 'never', outputFolder: 'playwright-report' }],
        ['junit', { outputFile: 'test-results/junit.xml' }],
        ['json', { outputFile: 'test-results/results.json' }],
        ['list']
      ]
    : [
        ['html', { open: 'on-failure', outputFolder: 'playwright-report' }],
        ['junit', { outputFile: 'test-results/junit.xml' }],
        ['list']
      ],

  use: {
    baseURL: AppConfig.BaseURL,

    trace: 'on-first-retry',

    screenshot: {
      mode: 'on',
      fullPage: true
    },

    video: 'retain-on-failure',

    headless: isCI ? true : false,

    viewport: null

  },

  projects: [
    {
      name: 'chromium',
      use: {
        launchOptions: {
          slowMo: isCI ? 0 : 1000,
          args: ['--no-sandbox', '--start-maximized']
        }
      }
    }
  ]
});