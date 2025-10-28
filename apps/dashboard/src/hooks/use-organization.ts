import { useQueryClient } from "@tanstack/react-query";
import { authClient } from "@/lib/auth-client";

export function useOrganization() {
  const queryClient = useQueryClient();
  const setActiveOrganization = async (organizationId: string | null) => {
    await authClient.organization.setActive({
      organizationId: organizationId,
    });
    queryClient.invalidateQueries();
  };
  const { data: activeOrganization } = authClient.useActiveOrganization();
  return {
    activeOrganization,
    setActiveOrganization,
  };
}
