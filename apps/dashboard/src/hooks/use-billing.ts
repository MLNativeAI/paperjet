import type { BillingRoutes } from "@paperjet/api/routes";
import { useQuery } from "@tanstack/react-query";
import { hc } from "hono/client";
import { authClient } from "@/lib/auth-client";
import type { TrialInfo } from "@/types";
import { useAuthenticatedUser } from "./use-user";

const billingClient = hc<BillingRoutes>("/api/v1/billing/");

export function useBilling() {
  const { session } = useAuthenticatedUser();
  const { data: subscriptions, isLoading: isCustomerLoading } = useQuery({
    queryKey: ["billing", session?.activeOrganizationId],
    staleTime: 30 * 1000,
    queryFn: async () => {
      if (session?.activeOrganizationId) {
        const response = await authClient.customer.subscriptions.list({
          query: {
            page: 1,
            limit: 10,
            active: true,
            referenceId: session.activeOrganizationId,
          },
        });
        return response.data?.result.items;
      }
    },
  });

  // Fetch product details for each subscription
  const { data: productMap, isLoading: isProductsLoading } = useQuery({
    queryKey: ["billing", subscriptions],
    queryFn: async () => {
      const response = await billingClient["product-info"].$get();

      if (!response.ok) {
        console.log("Failed to fetch product data");
        throw new Error("Failed to fetch product data");
      }

      return await response.json();
    },
  });

  const getSubscriptionName = () => {
    if (subscriptions && subscriptions.length > 0) {
      const productId = subscriptions[0].productId;
      return productMap?.[productId]?.name;
    }
    return "No active plan";
  };

  const getTrialInformation = (): TrialInfo => {
    if (subscriptions && subscriptions.length > 0) {
      const trialEnd = subscriptions[0].trialEnd;
      if (trialEnd) {
        return {
          onTrial: true,
          trialEnd: trialEnd,
        };
      }
    }
    return {
      onTrial: false,
      trialEnd: undefined,
    };
  };

  const hasActiveSubscription = subscriptions && subscriptions.length > 0;

  const isLoading = isCustomerLoading || isProductsLoading;

  return {
    subscriptions,
    productMap,
    isLoading,
    subscriptionName: getSubscriptionName(),
    trialInfo: getTrialInformation(),
    hasActiveSubscription,
  };
}
