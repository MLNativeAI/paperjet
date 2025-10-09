import { getOrganizationsByIds, getUserByEmail, getUserInvitations } from "@paperjet/db";
import { envVars, logger } from "@paperjet/shared";
import type { Context } from "hono";
import type { BlankEnv, BlankInput } from "hono/types";
import { auth } from "../index";
import type { UserInvitation } from "../types";

export async function listUserInvitations(c: Context<BlankEnv, "/invitations", BlankInput>) {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  if (!session) {
    return c.redirect("/auth/sign-in");
  }

  const invitations = await auth.api.listUserInvitations({
    query: {
      email: session.user.email,
    },
  });

  const pendingInvitations = invitations.filter((inv) => inv.status === "pending");

  const organizationIds = pendingInvitations.map((invitation) => invitation.organizationId);
  const organizations = await getOrganizationsByIds({
    organizationIds: organizationIds,
  });
  const organizationMap = new Map(organizations.map((org) => [org.id, org]));

  const invitationsWithOrgNames: UserInvitation[] = pendingInvitations.map((invitation) => ({
    ...invitation,
    organizationName: organizationMap.get(invitation.organizationId)?.name || "Unknown",
    expiresAt: invitation.expiresAt.toISOString(),
  }));

  return c.json(invitationsWithOrgNames);
}

export async function handleOrganizationInvite(c: Context<BlankEnv, "/accept-invitation", BlankInput>) {
  logger.debug(`Handling invitation ${c.req.query("invitationId")}`);

  const invitationId = c.req.query("invitationId");
  if (!invitationId) {
    return c.redirect(`${envVars.BASE_URL}/auth/sign-in`);
  }

  try {
    const invitationResponse = await getUserInvitations({
      invitationId: invitationId,
    });

    if (!invitationResponse) {
      return c.redirect(`${envVars.BASE_URL}/auth/sign-up?notFound=true`);
    }
    const email = invitationResponse?.email;
    const userData = await getUserByEmail({ email: email });
    if (!userData) {
      logger.debug(`User not found, redirecting to sign up`);
      return c.redirect(`${envVars.BASE_URL}/auth/sign-up?invitationId=${invitationId}`);
    } else {
      const session = await auth.api.getSession({ headers: c.req.raw.headers });
      if (!session) {
        logger.debug("User exists but not signed in, redirecting to sign-in");
        return c.redirect(`${envVars.BASE_URL}/auth/sign-in?invitationId=${invitationId}`);
      } else {
        logger.debug("User exists and signed in, redirecting to org settings page");
        return c.redirect(`${envVars.BASE_URL}/settings/organization`);
      }
    }
  } catch (error) {
    logger.error(error, "Unknown invitation error, redirecting to sign-up");
    return c.redirect(`${envVars.BASE_URL}/auth/sign-up`);
  }
}
