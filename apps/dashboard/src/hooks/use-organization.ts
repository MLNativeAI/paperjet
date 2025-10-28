import { authClient } from "@/lib/auth-client";

export function useOrganization() {
  const setActiveOrganization = async (organizationId: string | null) => {
    await authClient.organization.setActive({
      organizationId: organizationId,
    });
  };
  const { data: activeOrganization } = authClient.useActiveOrganization();
  return {
    activeOrganization,
    setActiveOrganization,
  };
}
