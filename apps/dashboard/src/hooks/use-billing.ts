import type { BillingRoutes } from "@paperjet/api/routes";
import { useQuery } from "@tanstack/react-query";
import { hc } from "hono/client";
import { authClient } from "@/lib/auth-client";

const billingClient = hc<BillingRoutes>("/api/v1/billing/");

export function useBilling(organizationId: string | null | undefined) {
  const { data: subscriptions, isLoading: isCustomerLoading } = useQuery({
    queryKey: ["billing", organizationId],
    staleTime: 30 * 1000,
    queryFn: async () => {
      // const response = await authClient.customer.state();
      // console.log(response.data);
      // return response.data;

      if (organizationId) {
        const response = await authClient.customer.subscriptions.list({
          query: {
            page: 1,
            limit: 10,
            active: true,
            referenceId: organizationId,
          },
        });
        console.log(response.data);
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

  const isLoading = isCustomerLoading || isProductsLoading;

  return {
    subscriptions,
    productMap,
    isLoading,
  };
}
