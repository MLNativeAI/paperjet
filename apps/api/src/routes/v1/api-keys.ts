import { auth } from "@paperjet/auth";
import { getUserSession } from "@paperjet/auth/session";
import { getApiKey, getApiKeys, updateApiKeyOwner } from "@paperjet/db";
import { logger } from "@paperjet/shared";
import { Hono } from "hono";
import { describeRoute, resolver, validator as zValidator } from "hono-openapi";
import { z } from "zod";

const app = new Hono();

const router = app
  .get(
    "/",
    describeRoute({
      description: "Get all API keys for the organization",
      responses: {
        200: {
          description: "List of API keys",
          content: {
            "application/json": {
              schema: resolver(z.array(z.any())),
            },
          },
        },
        500: {
          description: "Error response",
          content: {
            "application/json": {
              schema: resolver(z.object({ error: z.string() })),
            },
          },
        },
      },
    }),
    async (c) => {
      try {
        const { session } = await getUserSession(c);
        const apiKeys = await getApiKeys({
          organizationId: session.activeOrganizationId,
        });
        return c.json(apiKeys);
      } catch (error) {
        logger.error(error, "Failed to get api keys");
        return c.json({ error: "Internal server error" }, 500);
      }
    },
  )
  .post(
    "/",
    describeRoute({
      description: "Create a new API key",
      responses: {
        200: {
          description: "API key created",
          content: {
            "application/json": {
              schema: resolver(
                z.object({
                  id: z.string(),
                  name: z.string(),
                  key: z.string(),
                }),
              ),
            },
          },
        },
        500: {
          description: "Error response",
          content: {
            "application/json": {
              schema: resolver(z.object({ error: z.string() })),
            },
          },
        },
      },
    }),
    zValidator("json", z.object({ name: z.string().min(1) })),
    async (c) => {
      try {
        const { name } = c.req.valid("json");
        const { session } = await getUserSession(c);
        const newKey = await auth.api.createApiKey({
          body: {
            name,
          },
          headers: c.req.raw.headers,
        });

        await updateApiKeyOwner({
          apiKeyId: newKey.id,
          organizationId: session.activeOrganizationId,
        });

        return c.json({
          id: newKey.id,
          name: newKey.name,
          key: newKey.key,
        });
      } catch (error) {
        logger.error(error, "Failed to create api key");
        return c.json({ error: "Internal server error" }, 500);
      }
    },
  )
  .delete(
    "/:id",
    describeRoute({
      description: "Revoke an API key",
      responses: {
        200: {
          description: "API key revoked",
          content: {
            "application/json": {
              schema: resolver(z.object({ message: z.string() })),
            },
          },
        },
        404: {
          description: "Key not found",
          content: {
            "application/json": {
              schema: resolver(z.object({ error: z.string() })),
            },
          },
        },
        500: {
          description: "Error response",
          content: {
            "application/json": {
              schema: resolver(z.object({ error: z.string() })),
            },
          },
        },
      },
    }),
    async (c) => {
      try {
        const { id } = c.req.param();
        const { session } = await getUserSession(c);

        try {
          await getApiKey({ organizationId: session.activeOrganizationId });
        } catch (_) {
          return c.json({ error: "Key not found" }, 404);
        }
        await auth.api.updateApiKey({
          body: {
            keyId: id,
            enabled: false,
          },
          headers: c.req.raw.headers,
        });

        return c.json({ message: "API key revoked successfully" });
      } catch (error) {
        logger.error(error, "Failed to revoke api key");
        return c.json({ error: "Internal server error" }, 500);
      }
    },
  );

export { router as v1ApiKeyRouter };

export type ApiKeysRoutes = typeof router;
