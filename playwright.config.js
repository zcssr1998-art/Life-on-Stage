const { defineConfig, devices } = require('@playwright/test');
module.exports = defineConfig({
  testDir: './tests',
  timeout: 120000,
  expect: { timeout: 5000 },
  use: {
    baseURL: 'http://127.0.0.1:4173',
    ...devices['iPhone 13'],
    trace: 'retain-on-failure'
  },
  projects: [{ name: 'webkit', use: { browserName: 'webkit' } }]
});
