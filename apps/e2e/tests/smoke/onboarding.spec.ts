import { expect, test } from "@playwright/test";

test.describe("Onboarding API", () => {
  test("should handle requests to onboarding info endpoint", async ({ request }) => {
    const response = await request.get("/api/internal/onboarding");

    // Should not be accessible without proper authentication
    expect(response.ok()).toBeFalsy();
    expect([401, 404]).toContain(response.status());
  });

  test("should handle requests to onboarding completion endpoint", async ({ request }) => {
    const response = await request.post("/api/internal/onboarding/complete");

    // Should not be accessible without proper authentication
    expect(response.ok()).toBeFalsy();
    expect([401, 404]).toContain(response.status());
  });

  test("should handle GET requests to complete endpoint", async ({ request }) => {
    const response = await request.get("/api/internal/onboarding/complete");

    // Should not be accessible without proper authentication
    expect(response.ok()).toBeFalsy();
    expect([401, 404]).toContain(response.status());
  });
});
