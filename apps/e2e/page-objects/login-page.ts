import type { Locator, Page } from "@playwright/test";

export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.getByLabel("Email");
    this.passwordInput = page.getByLabel("Password");
    this.submitButton = page.getByRole("button", {
      name: /sign in|login|submit/i,
    });
    this.errorMessage = page.locator('[data-test-id="login-error"]');
  }

  async goto() {
    await this.page.goto("/auth/sign-in");
    await this.page.waitForLoadState("load");
  }

  async login(email: string, password: string) {
    console.log(`Logging in with ${email}`);
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
    await this.page.waitForLoadState("load");

    // Wait for navigation to complete - we should be redirected away from sign-in
    try {
      await this.page.waitForURL(/^(?!.*\/sign-in).*$/, { timeout: 10000 });
      console.log("Login successful, redirected away from sign-in page");
    } catch (error) {
      console.error("Login failed, still on sign-in page or unexpected error");
      throw new Error(`Login failed: ${error}`);
    }
  }

  async getErrorMessage(): Promise<string | null> {
    try {
      await this.errorMessage.waitFor({ state: "visible", timeout: 3000 });
      return await this.errorMessage.textContent();
    } catch (_error) {
      return null;
    }
  }
}
