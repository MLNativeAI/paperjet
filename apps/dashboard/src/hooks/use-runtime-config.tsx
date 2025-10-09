import type { AdminRoutes } from "@paperjet/api/routes";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { hc } from "hono/client";

const adminClient = hc<AdminRoutes>("/api/v1/admin");

export function useRuntimeConfig() {
  const queryClient = useQueryClient();

  const {
    data: runtimeConfig = { fastModel: null, accurateModel: null },
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["runtime-config"],
    queryFn: async () => {
      const response = await adminClient["runtime-config"].$get({});

      if (!response.ok) {
        console.log("Failed to fetch runtime config");
        throw new Error("Failed to fetch runtime config");
      }

      return response.json();
    },
  });

  const setRuntimeModelMutation = useMutation({
    mutationFn: async ({ type, modelId }: { type: "fast" | "accurate"; modelId: string }) => {
      const response = await adminClient["runtime-config"].$post({
        json: {
          type,
          modelId,
        },
      });
      if (!response.ok) {
        throw new Error("Failed to set runtime model");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["runtime-config"] });
    },
  });

  return {
    runtimeConfig,
    isLoading,
    refetch,
    setRuntimeModel: setRuntimeModelMutation.mutate,
    isSettingModel: setRuntimeModelMutation.isPending,
  };
}
