import {
  createOrganization,
  createOrganizationMember,
  getUserById,
  getUserOrganizations,
  updateLastActiveOrgId,
} from "@paperjet/db";
import { logger } from "@paperjet/shared";
import { generateId, ID_PREFIXES } from "@paperjet/shared/id";
import type { Session, User } from "better-auth";
import type { Context } from "hono";
import { auth } from "../auth";
import type { SessionWithOrg } from "../types";
import { detectOrgNameFromEmail } from "../util/email";

function sessionWithOrgAndCustomId(session: Session, orgId: string): SessionWithOrg {
  return {
    ...session,
    activeOrganizationId: orgId,
    id: generateId(ID_PREFIXES.session),
  };
}

export async function beforeSessionCreateHandler(session: Session) {
  const orgId = await getDefaultOrgOrCreate(session.userId);
  if (!orgId) {
    throw new Error("org not found");
  }
  await updateLastActiveOrgId({
    organizationId: orgId,
    userId: session.userId,
  });

  logger.info(session, "Creating session");
  return {
    data: sessionWithOrgAndCustomId(session, orgId),
  };
}

export const getDefaultOrgOrCreate = async (userId: string) => {
  try {
    const userData = await getUserById({ userId: userId });
    if (userData?.lastActiveOrgId) {
      return userData.lastActiveOrgId;
    } else {
      const userOrgs = await getUserOrganizations({ userId: userId });
      if (userOrgs.length > 0) {
        return userOrgs[0]?.organizationId;
      } else {
        const orgName = userData?.email ? await detectOrgNameFromEmail(userData?.email) : "Default";
        //TODO: make a transaction
        const { id: organizationId } = await createOrganization({
          name: orgName,
        });
        await createOrganizationMember({
          organizationId: organizationId,
          userId: userId,
          role: "owner",
        });
        logger.info("Org and member created");
        return organizationId;
      }
    }
  } catch (error) {
    logger.error(error, "Create org failed:");
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
  session: SessionWithOrg;
}> => {
  const sessionData = await auth.api.getSession({ headers: c.req.raw.headers });
  if (!sessionData) {
    throw new Error("Unauthorized");
  }
  if (!sessionData.session.activeOrganizationId) {
    // api key session aren't real session so no activeOrgID exists
    if (sessionData.user.lastActiveOrgId) {
      //TODO: We need to update the api key session logic to bind it directly to the session
      // Right now we're just using last org which is shitty at best
      // We'll definitely have to override the auth logic since we can't do any fetching here, this needs to be a quick lookup fn call
      const mockApiSession = sessionWithOrgAndCustomId(sessionData.session, sessionData.user.lastActiveOrgId);
      return {
        user: sessionData.user,
        session: mockApiSession,
      };
    } else {
      throw new Error("Active organization is missing");
    }
  }
  return {
    user: sessionData.user,
    session: {
      ...sessionData.session,
      activeOrganizationId: sessionData.session.activeOrganizationId,
    },
  };
};
