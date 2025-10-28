import { handleCustomerDeletion } from "@paperjet/billing";
import { doesAdminAccountExist } from "@paperjet/db";
import { db } from "@paperjet/db/db";
import * as schema from "@paperjet/db/schema";
import { envVars, logger } from "@paperjet/shared";
import { generateId, ID_PREFIXES } from "@paperjet/shared/id";
import { betterAuth, type User } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin, apiKey, magicLink, organization } from "better-auth/plugins";
import { sendInvitationEmail, sendMagicLink, sendPasswordResetEmail } from "./handlers/email";
import { getDefaultOrgOrCreate } from "./handlers/session";
import { getPolarPlugin } from "./polar";

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
        enabled: true,
        timeWindow: 60000,
        maxRequests: 100,
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
    },
    microsoft: {
      enabled: envVars.MICROSOFT_CLIENT_ID !== undefined && envVars.MICROSOFT_CLIENT_SECRET !== undefined,
      clientSecret: envVars.MICROSOFT_CLIENT_SECRET || "",
      clientId: envVars.MICROSOFT_CLIENT_ID || "",
    },
  },
  trustedOrigins: [envVars.BASE_URL],
});

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
