import { getAuthContext } from "@paperjet/auth/session";
import { getOrganization } from "@paperjet/db";
import { logger } from "@paperjet/shared";
import { Hono } from "hono";
import { describeRoute, resolver } from "hono-openapi";
import { z } from "zod";

const router = new Hono().get(
  "/current",
  describeRoute({
    description: "Get current organization data including active plan",
    responses: {
      200: {
        description: "Organization data retrieved successfully",
        content: {
          "application/json": {
            schema: resolver(
              z.object({
                id: z.string(),
                name: z.string(),
                slug: z.string().optional(),
                logo: z.string().optional(),
                activePlan: z.enum(["free", "basic", "pro"]),
                createdAt: z.string(),
              }),
            ),
          },
        },
      },
      401: {
        description: "Unauthorized",
      },
      404: {
        description: "Organization not found",
      },
    },
  }),
  async (c) => {
    try {
      const authContext = await getAuthContext(c);

      if (!authContext.organizationId) {
        return c.json({ error: "No active organization" }, 401);
      }

      const organization = await getOrganization({
        organizationId: authContext.organizationId,
      });

      if (!organization) {
        return c.json({ error: "Organization not found" }, 404);
      }

      return c.json({
        id: organization.id,
        name: organization.name,
        slug: organization.slug,
        logo: organization.logo,
        activePlan: organization.activePlan,
        createdAt: organization.createdAt.toISOString(),
      });
    } catch (error) {
      logger.error(error, "Failed to get organization data");
      return c.json({ error: "Internal server error" }, 500);
    }
  },
);

export { router as v1OrganizationRouter };
export type V1OrganizationRoutes = typeof router;
