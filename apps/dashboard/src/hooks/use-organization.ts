import { useQueryClient } from "@tanstack/react-query";
import { authClient } from "@/lib/auth-client";
import { usePostHog } from "@posthog/react";

export function useOrganization() {
  const queryClient = useQueryClient();
  const posthog = usePostHog();
  const { data: activeOrganization } = authClient.useActiveOrganization();

  const setActiveOrganization = async (organizationId: string | null) => {
    const previousOrgId = activeOrganization?.id || null;
    await authClient.organization.setActive({
      organizationId: organizationId,
    });

    if (organizationId && organizationId !== previousOrgId) {
      posthog.capture("organization_switched", {
        from_organization_id: previousOrgId,
        to_organization_id: organizationId,
      });
    }

    queryClient.invalidateQueries();
  };

  return {
    activeOrganization,
    setActiveOrganization,
  };
}
