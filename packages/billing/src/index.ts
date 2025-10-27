import { envVars, logger } from "@paperjet/shared";
import { Polar } from "@polar-sh/sdk";
import type { Product } from "@polar-sh/sdk/models/components/product.js";
import type { WebhookCustomerStateChangedPayload } from "@polar-sh/sdk/models/components/webhookcustomerstatechangedpayload.js";

export async function polarWebhookHandler(payload: WebhookCustomerStateChangedPayload): Promise<void> {
  console.log("Handling polar webhook");
  console.log(payload);
}

export async function handleCustomerDeletion(userId: string) {
  const polarClient = getPolarClient();
  await polarClient.customers.deleteExternal({
    externalId: userId,
  });
}

export function getPolarClient() {
  // if (envVars.SAAS_MODE) {
  return new Polar({
    accessToken: envVars.POLAR_ACCESS_TOKEN,
    server: "sandbox",
  });
  // }
}

export async function getProductMap() {
  const polarClient = getPolarClient();
  const products = await polarClient.products.list({ isArchived: false });
  const productMap = products.result.items.reduce(
    (
      acc: {
        [x: string]: Product;
      },
      product,
    ) => {
      acc[product.id] = { ...product };
      return acc;
    },
    {},
  );
  return productMap;
}

export async function incrementUsage(userId: string, orgId: string) {
  // if (envVars.SAAS_MODE) {
  logger.info(`Incrementing usage for ${userId}`);
  const polarClient = getPolarClient();
  await polarClient.events.ingest({
    events: [
      {
        name: "document_conversion",
        externalCustomerId: userId,
        metadata: {
          orgId: orgId,
        },
      },
    ],
  });
  // }
}
