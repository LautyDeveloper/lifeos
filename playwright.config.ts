import "dotenv/config"

import { defineConfig, devices } from "@playwright/test"

const databaseUrl = process.env.DATABASE_URL ?? ""

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: "http://127.0.0.1:3100",
    trace: "on-first-retry",
  },
  webServer: {
    command: "corepack pnpm@8.15.9 dev --hostname 127.0.0.1 --port 3100",
    url: "http://127.0.0.1:3100",
    reuseExistingServer: !process.env.CI,
    env: {
      DATABASE_URL: databaseUrl,
      DEMO_READ_ONLY: process.env.DEMO_READ_ONLY ?? "false",
      OPENAI_API_KEY: process.env.OPENAI_API_KEY ?? "",
    },
  },
  projects: [
    { name: "desktop-chromium", use: { ...devices["Desktop Chrome"], browserName: "chromium" } },
    { name: "mobile-chromium", use: { ...devices["iPhone 13"], browserName: "chromium" } },
  ],
})
