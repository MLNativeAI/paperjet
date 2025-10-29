import { getPolarClient, polarWebhookHandler } from "@paperjet/billing";
import { envVars } from "@paperjet/shared";
import { checkout, polar, portal, usage, webhooks } from "@polar-sh/better-auth";
import type { BetterAuthPlugin } from "better-auth";

export function getPolarPlugin(): BetterAuthPlugin {
  if (envVars.SAAS_MODE) {
    return polar({
      client: getPolarClient(),
      createCustomerOnSignUp: true,
      use: [
        checkout({
          products: [
            {
              productId: envVars.POLAR_BASIC_PLAN_ID || "",
              slug: "basic",
            },
            {
              productId: envVars.POLAR_PRO_PLAN_ID || "",
              slug: "pro",
            },
          ],
          successUrl: `${envVars.BASE_URL}/settings/billing?checkout_success=true&checkout_id={CHECKOUT_ID}`,
          authenticatedUsersOnly: true,
          returnUrl: envVars.BASE_URL,
        }),
        portal({
          returnUrl: `${envVars.BASE_URL}/settings/billing`,
        }),
        usage(),
        webhooks({
          secret: envVars.POLAR_WEBHOOK_SECRET || "",
          onCustomerStateChanged: (payload) => polarWebhookHandler(payload),
        }),
      ],
    });
  } else {
    return {
      id: "disabledPolarPlugin",
    };
  }
}
