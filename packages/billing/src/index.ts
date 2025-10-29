import { updateOrganizationActivePlan } from "@paperjet/db";
import { envVars, logger } from "@paperjet/shared";
import { Polar } from "@polar-sh/sdk";
import type { Product } from "@polar-sh/sdk/models/components/product.js";
import type { WebhookCustomerStateChangedPayload } from "@polar-sh/sdk/models/components/webhookcustomerstatechangedpayload.js";

export async function polarWebhookHandler(payload: WebhookCustomerStateChangedPayload): Promise<void> {
  logger.info("Handling polar webhook", { payload });

  const { activeSubscriptions } = payload.data;

  let organizationId: string | undefined;
  let activePlan: "free" | "basic" | "pro" = "free";

  if (activeSubscriptions && activeSubscriptions.length > 0) {
    try {
      const firstSubscription = activeSubscriptions[0];

      if (firstSubscription) {
        const referenceId = firstSubscription.metadata?.referenceId;
        if (!referenceId || typeof referenceId !== "string") {
          logger.warn("Webhook subscription missing or invalid referenceId in metadata");
          return;
        }
        organizationId = referenceId;

        const productMap = await getProductMap();
        const product = productMap[firstSubscription.productId];

        if (product?.name) {
          const planName = product.name.toLowerCase();

          if (planName.includes("basic")) {
            activePlan = "basic";
          } else if (planName.includes("pro")) {
            activePlan = "pro";
          }
        }
      }
    } catch (error) {
      logger.error(error, "Failed to determine plan from webhook payload");
      return;
    }
  } else {
    logger.warn("Webhook payload has no active subscriptions");
    return;
  }

  try {
    if (!organizationId) {
      logger.error("Organization ID is undefined, cannot update plan");
      return;
    }

    await updateOrganizationActivePlan({ organizationId, activePlan });
    logger.info(`Updated organization ${organizationId} active plan to ${activePlan}`);
  } catch (error) {
    logger.error(error, `Failed to update organization ${organizationId} active plan`);
  }
}

export async function handleCustomerDeletion(userId: string) {
  const polarClient = getPolarClient();
  await polarClient.customers.deleteExternal({
    externalId: userId,
  });
}

export function getPolarClient() {
  return new Polar({
    accessToken: envVars.POLAR_ACCESS_TOKEN,
    server: envVars.ENVIRONMENT === "prod" ? "production" : "sandbox",
  });
}

export async function getProductMap() {
  logger.debug(envVars.SAAS_MODE);
  if (!envVars.SAAS_MODE) {
    logger.debug("Saas mode not enabled");
    return {};
  }
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
  if (!envVars.SAAS_MODE) {
    logger.debug("Not incrementing usage");
    return;
  }
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
}
