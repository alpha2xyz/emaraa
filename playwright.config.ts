import { defineConfig, devices } from "@playwright/test";

/**
 * Emaraa Playwright Configuration
 *
 * Base URL priority:
 *   1. PLAYWRIGHT_BASE_URL env var  (set by /emaraa:website-test skill)
 *   2. Defaults to http://localhost:5000
 *
 * To test against production:
 *   PLAYWRIGHT_BASE_URL=https://emaraa.app npx playwright test
 *
 * To run a single file:
 *   npx playwright test tests/public.spec.ts
 *
 * To run headed (watch mode):
 *   npx playwright test --headed
 *
 * First-time setup — install browsers:
 *   npx playwright install chromium
 */

const isLocal = !process.env.PLAYWRIGHT_BASE_URL || process.env.PLAYWRIGHT_BASE_URL.includes("localhost");
const BASE_URL = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:5000";

export default defineConfig({
  testDir: "./tests",
  timeout: 30_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,   // sequential — avoids race conditions on shared Supabase state
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: process.env.CI ? "dot" : "list",

  use: {
    baseURL: BASE_URL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    // Treat the app as Arabic/RTL — consistent with production default
    locale: "ar-SA",
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],

  // Only auto-start the dev server when running locally.
  // When PLAYWRIGHT_BASE_URL points to production, skip this block.
  ...(isLocal && {
    webServer: {
      command: "HOST=127.0.0.1 PORT=5000 npm run dev",
      url: "http://127.0.0.1:5000",
      reuseExistingServer: true,
      timeout: 60_000,
    },
  }),

  // Store generated auth state files here — these are git-ignored
  // and must be populated manually for the dashboard test suites to run.
  // See tests/README-auth.md for instructions.
  outputDir: "test-results",
});
