import { auth } from "@paperjet/auth";
import { handleOrganizationInvite, listUserInvitations } from "@paperjet/auth/invitations";
import { doesAdminAccountExist, getUserById, updateUserOnboarding } from "@paperjet/db";
import { envVars } from "@paperjet/shared";
import { Hono } from "hono";
import { describeRoute, resolver } from "hono-openapi";
import { z } from "zod";

const app = new Hono();

const router = app
  .get(
    "/server-info",
    describeRoute({
      description: "Get server information including admin account existence and auth mode",
      responses: {
        200: {
          description: "Successful response",
          content: {
            "application/json": {
              schema: resolver(
                z.object({
                  adminAccountExists: z.boolean(),
                  saasMode: z.boolean(),
                  authMode: z.string(),
                }),
              ),
            },
          },
        },
      },
      hide: true,
    }),
    async (c) => {
      const adminAccountExists = await doesAdminAccountExist();
      return c.json({
        adminAccountExists: adminAccountExists,
        saasMode: envVars.SAAS_MODE,
        authMode: envVars.AUTH_MODE,
      });
    },
  )
  .get(
    "/accept-invitation",
    describeRoute({
      description: "Accept organization invitation",
      responses: {
        200: {
          description: "Invitation accepted",
        },
        302: {
          description: "Redirect after acceptance",
        },
      },
      hide: true,
    }),
    async (c) => {
      return handleOrganizationInvite(c);
    },
  )
  .get(
    "/invitations",
    describeRoute({
      description: "List user invitations",
      responses: {
        200: {
          description: "List of invitations",
          content: {
            "application/json": {
              schema: resolver(
                z.array(
                  z.object({
                    id: z.string(),
                    email: z.string(),
                    role: z.string().optional(),
                    status: z.string(),
                    expiresAt: z.string(),
                    inviterId: z.string(),
                  }),
                ),
              ),
            },
          },
        },
      },
      hide: true,
    }),
    async (c) => {
      return listUserInvitations(c);
    },
  )
  .get(
    "/auth-callback",
    describeRoute({
      description: "Handle authentication callback",
      responses: {
        302: {
          description: "Redirect to base URL",
        },
      },
      hide: true,
    }),
    async (c) => {
      const query = c.req.query();
      const queryString = new URLSearchParams(query).toString();
      return c.redirect(`${envVars.BASE_URL}${queryString ? `?${queryString}` : ""}`);
    },
  )
  .get(
    "/onboarding",
    describeRoute({
      description: "Get user onboarding information",
      responses: {
        200: {
          description: "Onboarding information retrieved successfully",
          content: {
            "application/json": {
              schema: resolver(
                z.object({
                  onboardingCompleted: z.boolean(),
                  role: z.string().optional(),
                }),
              ),
            },
          },
        },
        401: {
          description: "Unauthorized",
        },
        500: {
          description: "Internal server error",
        },
      },
      hide: true,
    }),
    async (c) => {
      try {
        const session = await auth.api.getSession({ headers: c.req.raw.headers });
        if (!session) {
          return c.redirect("/auth/sign-in");
        }

        const user = await getUserById({ userId: session.user.id });
        if (!user) {
          return c.json({ error: "User not found" }, 404);
        }

        return c.json({
          onboardingCompleted: user.onboardingCompleted,
          role: user.role,
        });
      } catch (error) {
        console.error("Failed to get onboarding info:", error);
        return c.json({ error: "Internal server error" }, 500);
      }
    },
  )
  .post(
    "/onboarding/complete",
    describeRoute({
      description: "Complete user onboarding",
      responses: {
        200: {
          description: "Onboarding completed successfully",
          content: {
            "application/json": {
              schema: resolver(
                z.object({
                  success: z.boolean(),
                }),
              ),
            },
          },
        },
        401: {
          description: "Unauthorized",
        },
        500: {
          description: "Internal server error",
        },
      },
      hide: true,
    }),
    async (c) => {
      try {
        //TODO: split this router into public/private routes and use proper auth context
        // const { userId } = await getAuthContext(c);
        // if (!userId) {
        //   return c.json({ error: "Unauthorized" }, 401);
        // }
        const session = await auth.api.getSession({ headers: c.req.raw.headers });
        if (!session) {
          return c.redirect("/auth/sign-in");
        }

        await updateUserOnboarding({ userId: session.user.id });

        return c.json({ success: true });
      } catch (error) {
        console.error("Failed to complete onboarding:", error);
        return c.json({ error: "Internal server error" }, 500);
      }
    },
  );
export { router as internalRouter };
export type InternalRoutes = typeof router;
