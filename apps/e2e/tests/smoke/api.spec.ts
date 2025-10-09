import { expect, test } from "@playwright/test";

test.describe("API Health Check", () => {
  test("should return OK from health endpoint", async ({ request }) => {
    const response = await request.get("/api/health");

    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body).toHaveProperty("status");
    expect(body.status).toBe("ok");
  });

  test("should return correct headers from health endpoint", async ({ request }) => {
    const response = await request.get("/api/health");

    const contentType = response.headers()["content-type"];
    expect(contentType).toContain("application/json");
  });

  test("should handle non-existent endpoints", async ({ request }) => {
    const response = await request.get("/api/non-existent-endpoint");

    expect(response.ok()).toBeFalsy();
    expect(response.status()).toBe(404);
  });
});
