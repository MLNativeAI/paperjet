import type { AdminRoutes } from "@paperjet/api/routes";
import { useQuery } from "@tanstack/react-query";
import { hc, type InferResponseType } from "hono/client";

const adminClient = hc<AdminRoutes>("/api/v1/admin");

const getUsageDataRequest = adminClient["usage-data"].$get({});
type UsageDataResponse = InferResponseType<typeof getUsageDataRequest>;

export function useUsageData() {
  const { data: usageData = {} as UsageDataResponse, isLoading: usageDataLoading } = useQuery({
    queryKey: ["usage-data"],
    queryFn: async () => {
      const response = await getUsageDataRequest;
      return response.json();
    },
  });
  return {
    usageData,
    usageDataLoading,
  };
}
