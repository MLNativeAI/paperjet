import type { BillingRoutes } from "@paperjet/api/routes";
import { useQuery } from "@tanstack/react-query";
import { hc } from "hono/client";
import { authClient } from "@/lib/auth-client";
import type { TrialInfo } from "@/types";
import { useOrganization } from "./use-organization";

const billingClient = hc<BillingRoutes>("/api/v1/billing/");

export function useBilling() {
  const { activeOrganization } = useOrganization();
  const { data: subscriptions, isLoading: isCustomerLoading } = useQuery({
    queryKey: ["billing", activeOrganization],
    staleTime: 30 * 1000,
    queryFn: async () => {
      if (activeOrganization?.id) {
        const response = await authClient.customer.subscriptions.list({
          query: {
            page: 1,
            limit: 10,
            active: true,
            referenceId: activeOrganization?.id,
          },
        });
        return response.data?.result.items;
      }
    },
  });

  // Fetch product details for each subscription
  const { data: productMap, isLoading: isProductsLoading } = useQuery({
    queryKey: ["billing", subscriptions],
    enabled: !isCustomerLoading,
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

  const getUsageInfo = () => {
    if (subscriptions && subscriptions.length > 0 && subscriptions[0].meters.length > 0) {
      const consumed = subscriptions[0].meters[0].consumedUnits;
      const total = subscriptions[0].meters[0].creditedUnits;
      const currentPeriodEnd = subscriptions[0].currentPeriodEnd;

      return {
        consumed,
        total,
        currentPeriodEnd,
        hasUsage: true,
      };
    }
    return {
      consumed: 0,
      total: 0,
      currentPeriodEnd: null,
      hasUsage: false,
    };
  };

  const getPlanType = (): "none" | "basic" | "pro" => {
    const name = getSubscriptionName()?.toLowerCase() || "";
    if (name.includes("basic")) return "basic";
    if (name.includes("pro")) return "pro";
    return "none";
  };

  const isLoading = isCustomerLoading || isProductsLoading;

  return {
    subscriptions,
    productMap,
    isLoading,
    subscriptionName: getSubscriptionName(),
    trialInfo: getTrialInformation(),
    hasActiveSubscription,
    usageInfo: getUsageInfo(),
    planType: getPlanType(),
  };
}
