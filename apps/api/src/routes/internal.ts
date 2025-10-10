import { handleOrganizationInvite, listUserInvitations } from "@paperjet/auth/invitations";
import { doesAdminAccountExist } from "@paperjet/db";
import { envVars, getAuthMode } from "@paperjet/shared";
import { Hono } from "hono";
import { describeRoute, resolver } from "hono-openapi";
import z from "zod";

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
      const authMode = getAuthMode();
      return c.json({
        adminAccountExists: adminAccountExists,
        authMode: authMode,
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
              schema: resolver(z.array(z.any())), // TODO: define proper schema
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
  );
export { router as internalRouter };
export type InternalRoutes = typeof router;
