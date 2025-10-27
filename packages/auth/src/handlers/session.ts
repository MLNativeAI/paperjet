import { createOrganization, createOrganizationMember, getUserById, getUserOrganizations } from "@paperjet/db";
import { logger } from "@paperjet/shared";
import type { Session, User } from "better-auth";
import type { Context } from "hono";
import { auth } from "../auth";
import { detectOrgNameFromEmail } from "../util/email";

export const getDefaultOrgOrCreate = async (userId: string) => {
  try {
    const userOrgs = await getUserOrganizations({ userId: userId });
    logger.info(userOrgs, "Found userOrgs");
    if (userOrgs.length > 0) {
      logger.info(userOrgs[0]?.organizationId, "Returning the first");
      return userOrgs[0]?.organizationId;
    } else {
      logger.info("Creating new org");
      const userData = await getUserById({ userId: userId });
      const orgName = userData?.email ? await detectOrgNameFromEmail(userData?.email) : "Default";

      const { id: organizationId } = await createOrganization({
        name: orgName,
      });
      logger.info(`Created ${organizationId}`);
      await createOrganizationMember({
        organizationId: organizationId,
        userId: userId,
        role: "owner",
      });
      logger.info("Org and member created");
      return organizationId;
    }
  } catch (error) {
    logger.error(error, "Create org failed:");
    return null;
  }
};

export const getUserIfLoggedIn = async (c: Context): Promise<string | undefined> => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  if (!session) {
    return undefined;
  }
  return session.user.id;
};

export const getUserSession = async (
  c: Context,
): Promise<{
  user: User;
  session: Session;
}> => {
  const sessionData = await auth.api.getSession({ headers: c.req.raw.headers });
  if (!sessionData) {
    throw new Error("Unauthorized");
  }
  if (!sessionData.session.activeOrganizationId) {
    throw new Error("Active organization is missing");
  }
  return {
    user: sessionData.user,
    session: sessionData.session,
  };
};
