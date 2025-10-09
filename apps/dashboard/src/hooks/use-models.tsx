import type { AdminRoutes } from "@paperjet/api/routes";
import type { DbModelConfiguration } from "@paperjet/db/types";
import { useQuery } from "@tanstack/react-query";
import { hc } from "hono/client";

const adminClient = hc<AdminRoutes>("/api/v1/admin");

export function useModels() {
  const {
    data: models = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["models"],
    queryFn: async (): Promise<DbModelConfiguration[]> => {
      const response = await adminClient.models.$get({});

      if (!response.ok) {
        console.log("Failed to fetch workflow");
        throw new Error("Failed to fetch workflow");
      }

      return response.json();
    },
  });

  return {
    models,
    isLoading,
    refetch,
  };
}
