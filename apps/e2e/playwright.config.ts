import { defineConfig, devices } from "@playwright/test";

const API_HOST = process.env.API_HOST || "http://localhost:3000";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  use: {
    baseURL: API_HOST,
    trace: "on-first-retry",
    extraHTTPHeaders: {
      Accept: "application/json",
      "x-api-key": process.env.API_KEY || "",
    },
  },

  projects: [
    {
      name: "smoke",
      testDir: "./tests/smoke",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "acc",
      testDir: "./tests/acc",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
