import type { AdminRoutes } from "@paperjet/api/routes";
import type { ConnectionValidationResult, ModelConfigParams } from "@paperjet/engine/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { hc } from "hono/client";

const adminClient = hc<AdminRoutes>("/api/v1/admin");

export function useModelConfiguration() {
  const queryClient = useQueryClient();

  const validateConnection = useMutation({
    mutationFn: async (config: ModelConfigParams) => {
      const response = await adminClient.models["validate-connection"].$post({
        json: config,
      });

      if (!response.ok) {
        const error = (await response.json()) as { error?: string };
        console.error(error);
        throw new Error(error.error || "Failed to validate connection");
      }

      return response.json() as Promise<ConnectionValidationResult>;
    },
  });

  const addModel = useMutation({
    mutationFn: async (config: ModelConfigParams) => {
      const response = await adminClient.models.add.$post({
        json: config,
      });

      if (!response.ok) {
        const error = (await response.json()) as { error?: string };
        console.error(error);
        throw new Error(error.error || "Failed to add model");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["models", "runtime-config"] });
    },
  });

  const updateModel = useMutation({
    mutationFn: async ({ id, config }: { id: string; config: ModelConfigParams }) => {
      const response = await adminClient.models.update.$put({
        json: { id, ...config },
      });

      if (!response.ok) {
        const error = (await response.json()) as { error?: string };
        console.error(error);
        throw new Error(error.error || "Failed to update model");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["models", "runtime-config"] });
    },
  });

  const deleteModel = useMutation({
    mutationFn: async (id: string) => {
      const response = await adminClient.models.delete.$delete({
        json: { id },
      });

      if (!response.ok) {
        const error = (await response.json()) as { error?: string };
        console.error(error);
        throw new Error(error.error || "Failed to delete model");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["models"] });
    },
  });

  return {
    validateConnection,
    addModel,
    updateModel,
    deleteModel,
  };
}
