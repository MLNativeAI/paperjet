import { useQuery } from "@tanstack/react-query";
import { hc } from "hono/client";
import type { BillingRoutes } from "@paperjet/api/routes";

const billingClient = hc<BillingRoutes>("/api/v1/billing");

interface Product {
  id: string;
  name: string;
  description: string | null;
  // Add other product fields as needed
}

type ProductInfoResponse = Record<string, Product>;

export function useBillingProducts() {
  return useQuery({
    queryKey: ["billing-products"],
    queryFn: async (): Promise<ProductInfoResponse> => {
      const response = await billingClient["product-info"].$get();
      if (!response.ok) {
        throw new Error("Failed to fetch billing products");
      }
      return response.json();
    },
    select: (data: ProductInfoResponse) => {
      // Extract product IDs from the product map
      // Order them as basic then pro to match the original hardcoded order
      const products = Object.values(data);
      const basicProduct = products.find((p) => p.name.toLowerCase().includes("basic"));
      const proProduct = products.find((p) => p.name.toLowerCase().includes("pro"));

      const productIds: string[] = [];
      if (basicProduct) productIds.push(basicProduct.id);
      if (proProduct) productIds.push(proProduct.id);

      return {
        productIds,
        products: data,
        hasBasic: !!basicProduct,
        hasPro: !!proProduct,
      };
    },
  });
}
