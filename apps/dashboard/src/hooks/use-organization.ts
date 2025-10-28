import type { V1OrganizationRoutes } from "@paperjet/api/routes";
import { useQuery } from "@tanstack/react-query";
import { hc } from "hono/client";
import { authClient } from "@/lib/auth-client";

const organizationClient = hc<V1OrganizationRoutes>("/api/v1/organization/");

export function useOrganization() {
  const setActiveOrganization = async (organizationId: string | null) => {
    await authClient.organization.setActive({
      organizationId: organizationId,
    });
  };

  const { data: activeOrganization } = authClient.useActiveOrganization();

  // Fetch detailed organization data including activePlan
  const { data: organizationData, isLoading: isOrgLoading } = useQuery({
    queryKey: ["organization", activeOrganization],
    staleTime: 30 * 1000,
    enabled: !!activeOrganization?.id,
    queryFn: async () => {
      if (activeOrganization?.id) {
        const response = await organizationClient.current.$get();
        if (!response.ok) {
          throw new Error("Failed to fetch organization data");
        }
        return await response.json();
      }
    },
  });

  return {
    activeOrganization,
    setActiveOrganization,
    organizationData,
    isOrgLoading,
  };
}
