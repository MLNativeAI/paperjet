import type { Session } from "better-auth";
import type { InvitationStatus } from "better-auth/plugins";

export type UserInvitation = {
  id: string;
  organizationId: string;
  organizationName: string;
  email: string;
  role: "member" | "admin" | "owner";
  status: InvitationStatus;
  inviterId: string;
  expiresAt: string;
};

export type SessionWithOrg = Session & {
  activeOrganizationId: string;
};
