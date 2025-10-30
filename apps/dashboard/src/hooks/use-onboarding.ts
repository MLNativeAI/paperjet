import type { InternalRoutes } from "@paperjet/api/routes";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { hc } from "hono/client";

const internalClient = hc<InternalRoutes>("/api/internal");

export function useOnboardingInfo() {
  return useQuery({
    queryKey: ["onboarding"],
    queryFn: async () => {
      const response = await internalClient.onboarding.$get();

      if (!response.ok) {
        throw new Error("Failed to get onboarding info");
      }

      return response.json();
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useCompleteOnboarding() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await internalClient.onboarding.complete.$post();

      if (!response.ok) {
        throw new Error("Failed to complete onboarding");
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate the onboarding query to refresh the data
      queryClient.invalidateQueries({ queryKey: ["onboarding"] });
    },
  });
}
