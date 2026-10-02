import { defineConfig, devices } from "@playwright/test"

/**
 * Click-through smoke test of the main screens (npm run test:e2e).
 *
 * Runs against E2E_BASE_URL (default: a local `next start` on port 3100)
 * and logs in with E2E_EMAIL / E2E_PASSWORD — use a dedicated test account
 * that has finished onboarding, never a real user's account. Without those
 * variables the logged-in tests are skipped.
 */
export default defineConfig({
  testDir: "./e2e",
  timeout: 45_000,
  retries: 0,
  reporter: "list",
  use: {
    baseURL: process.env.E2E_BASE_URL ?? "http://localhost:3100",
    locale: "nl-NL",
    timezoneId: "Europe/Amsterdam",
    trace: "retain-on-failure",
    ...(process.env.E2E_CHROMIUM_PATH
      ? { launchOptions: { executablePath: process.env.E2E_CHROMIUM_PATH } }
      : {}),
  },
  projects: [
    { name: "telefoon", use: { ...devices["Pixel 7"] } },
    { name: "desktop", use: { viewport: { width: 1366, height: 900 } } },
  ],
})
