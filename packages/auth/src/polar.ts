import { getPolarClient, polarWebhookHandler } from "@paperjet/billing";
import { envVars } from "@paperjet/shared";
import { checkout, polar, portal, usage, webhooks } from "@polar-sh/better-auth";

export function getPolarPlugin() {
  // if (process.env.SAAS_MODE) {
  return polar({
    client: getPolarClient(),
    createCustomerOnSignUp: true,
    use: [
      checkout({
        products: [
          {
            productId: "f772061e-7ef7-4628-b7e2-c7f9c2eb44a7",
            slug: "basic",
          },
          {
            productId: "9f067529-438f-44ca-9c5c-f7128b3dd9b3",
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
  // } else {
  //   return undefined;
  // }
}
