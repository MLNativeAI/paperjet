import { handleCustomerDeletion } from "@paperjet/billing";
import { doesAdminAccountExist } from "@paperjet/db";
import { db } from "@paperjet/db/db";
import * as schema from "@paperjet/db/schema";
import { envVars, logger } from "@paperjet/shared";
import { generateId, ID_PREFIXES } from "@paperjet/shared/id";
import { betterAuth, type User } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin, apiKey, magicLink, organization } from "better-auth/plugins";
import type { Context, Next } from "hono";
import { sendInvitationEmail, sendMagicLink, sendPasswordResetEmail } from "./handlers/email";
import { getDefaultOrgOrCreate } from "./handlers/session";
import { getPolarPlugin } from "./polar";
import { matchesPattern } from "./util/pattern";

const publicRoutes = ["/api/health", "/api/auth/**"];

export const auth = betterAuth({
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // Cache duration in seconds
    },
  },
  emailAndPassword: {
    enabled: true,
    sendResetPassword: sendPasswordResetEmail,
    onPasswordReset: async ({ user }, _) => {
      logger.info(`Password for user ${user.email} has been reset.`);
    },
  },
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: schema,
  }),

  user: {
    deleteUser: {
      enabled: true,
      afterDelete: async (user) => handleCustomerDeletion(user.id),
    },
    additionalFields: {
      role: {
        type: "string",
        input: false,
      },
    },
  },
  databaseHooks: {
    user: {
      create: {
        before: beforeUserCreateHandler,
      },
    },
    session: {
      create: {
        before: async (session) => {
          logger.info(`Creating session for user ${session.userId}`);
          const organizationId = await getDefaultOrgOrCreate(session.userId);
          if (!organizationId) {
            throw new Error("Organization not found");
          }
          logger.info(`Setting activeOrganizationId to ${organizationId} for user ${session.userId}`);
          return {
            data: {
              ...session,
              activeOrganizationId: organizationId,
            },
          };
        },
      },
    },
    account: {
      create: {
        before: async (account) => {
          return {
            data: {
              ...account,
              id: generateId(ID_PREFIXES.account),
            },
          };
        },
      },
    },
    verification: {
      create: {
        before: async (verification) => {
          return {
            data: {
              ...verification,
              id: generateId(ID_PREFIXES.verification),
            },
          };
        },
      },
    },
  },
  plugins: [
    getPolarPlugin(),
    admin({
      adminRoles: ["superadmin"],
    }),
    apiKey({
      rateLimit: {
        enabled: false,
      },
    }),
    organization({
      sendInvitationEmail: sendInvitationEmail,
      cancelPendingInvitationsOnReInvite: true,
      organizationHooks: {
        afterCreateOrganization: async ({ organization, member, user }) => {
          logger.info(`Organization ${organization.id} created for user ${user.id}`);
          logger.info(`Member ${member.id} created with role ${member.role}`);
        },
      },
    }),
    magicLink({
      sendMagicLink: sendMagicLink,
    }),
  ],
  socialProviders: {
    google: {
      prompt: "select_account",
      enabled: envVars.GOOGLE_CLIENT_ID !== undefined && envVars.GOOGLE_CLIENT_SECRET !== undefined,
      clientId: envVars.GOOGLE_CLIENT_ID || "",
      clientSecret: envVars.GOOGLE_CLIENT_SECRET || "",
      // redirectURI: envVars.BASE_URL,
    },
    microsoft: {
      enabled: envVars.MICROSOFT_CLIENT_ID !== undefined && envVars.MICROSOFT_CLIENT_SECRET !== undefined,
      clientId: envVars.MICROSOFT_CLIENT_ID || "",
      clientSecret: envVars.MICROSOFT_CLIENT_SECRET || "",
      // redirectURI: envVars.BASE_URL,
    },
  },
  trustedOrigins: [envVars.BASE_URL],
});

// Authentication middleware
export const requireAuth = async (c: Context, next: Next) => {
  if (publicRoutes.some((pattern) => matchesPattern(c.req.path, pattern))) {
    return next();
  }

  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  if (!session) {
    logger.info("missing auth");
    return c.json({ message: "Unauthorized" }, 401);
  }

  c.set("user", session.user);
  c.set("session", session.session);
  return next();
};

// Admin middleware
export const requireAdmin = async (c: Context, next: Next) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  if (!session) {
    logger.info("missing auth");
    return c.json({ message: "Unauthorized" }, 401);
  }
  if (!(session.user.role === "superadmin")) {
    logger.info("missing auth permissions");
    return c.json({ message: "Forbidden" }, 403);
  }
  return next();
};

export const authHandler = async (c: Context) => {
  return auth.handler(c.req.raw);
};

export async function beforeUserCreateHandler(user: User) {
  const adminAccountExists = await doesAdminAccountExist();
  if (!adminAccountExists) {
    // the first user registration will be the superadmin
    return {
      data: {
        ...user,
        id: generateId(ID_PREFIXES.user),
        role: "superadmin",
        emailVerified: true,
      },
    };
  } else {
    return {
      data: {
        ...user,
        id: generateId(ID_PREFIXES.user),
      },
    };
  }
}
