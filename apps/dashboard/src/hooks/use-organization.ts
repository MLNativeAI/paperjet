import { authClient } from "@/lib/auth-client";

export function useOrganization() {
  const { data: activeOrganization } = authClient.useActiveOrganization();

  return {
    activeOrganization,
    isOrgLoading: false,
  };
}
