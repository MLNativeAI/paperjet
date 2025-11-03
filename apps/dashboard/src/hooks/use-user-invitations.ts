import type { InternalRoutes } from "@paperjet/api/routes";
import type { UserInvitation } from "@paperjet/auth/types";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { hc } from "hono/client";
import { toast } from "sonner";
import { useOrganization } from "@/hooks/use-organization";
import { authClient } from "@/lib/auth-client";
import { usePostHog } from "@posthog/react";

const internalClient = hc<InternalRoutes>("/api/internal");

export function useUserInvitations() {
  const { setActiveOrganization } = useOrganization();
  const queryClient = useQueryClient();
  const posthog = usePostHog();
  const {
    data: invitations = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["user-invitations"],
    queryFn: async () => {
      const response = await internalClient.invitations.$get({});

      if (!response.ok) {
        console.log("Failed to fetch invitations");
        throw new Error("Failed to fetch invitations");
      }

      return response.json() as unknown as UserInvitation[];
    },
  });

  const acceptInvitation = async (invitationId: string, orgName: string) => {
    const { data: invResponse } = await authClient.organization.acceptInvitation({
      invitationId: invitationId,
    });
    if (!invResponse) {
      toast.error(`Failed to join ${orgName}`);
      return;
    }
    setActiveOrganization(invResponse.invitation.organizationId);
    posthog.capture("invitation_accepted", {
      invitation_id: invitationId,
      organization_name: orgName,
      organization_id: invResponse.invitation.organizationId,
    });
    toast.success(`You've joined the ${orgName} Organization`);
  };

  const rejectInvitation = async (invitationId: string, orgName: string) => {
    await authClient.organization.rejectInvitation({
      invitationId: invitationId,
    });
    posthog.capture("invitation_rejected", {
      invitation_id: invitationId,
      organization_name: orgName,
    });
    toast.success(`Invitation to ${orgName} rejected`);
    queryClient.invalidateQueries({ queryKey: ["user-invitations"] });
  };

  return {
    acceptInvitation,
    rejectInvitation,
    invitations,
    isLoading,
    error,
  };
}
