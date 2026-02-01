/**
 * Cypress E2E 测试配置
 * 遵循 technical-standards-v1.0、naming-conventions
 * 前端默认 http://localhost:3000 (Vite)
 */

const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    baseUrl: process.env.CYPRESS_BASE_URL || 'http://localhost:3000',
    specPattern: 'e2e/**/*.spec.js',
    supportFile: 'support/e2e.js',
    videosFolder: '../reports/cypress/videos',
    screenshotsFolder: '../reports/cypress/screenshots',
    viewportWidth: 1280,
    viewportHeight: 720,
    defaultCommandTimeout: 10000,
    responseTimeout: 10000,
    requestTimeout: 10000,
    video: true,
    screenshotOnRunFailure: true,
    env: {
      apiBase: process.env.API_BASE || 'http://localhost:8080',
    },
  },
});
