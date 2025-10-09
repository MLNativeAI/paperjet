import { zValidator } from "@hono/zod-validator";
import { auth } from "@paperjet/auth";
import { getUserSession } from "@paperjet/auth/session";
import { getApiKey, getApiKeys, updateApiKeyOwner } from "@paperjet/db";
import { logger } from "@paperjet/shared";
import { Hono } from "hono";
import { z } from "zod";

const app = new Hono();

const router = app
  .get("/", async (c) => {
    try {
      const { session } = await getUserSession(c);
      const apiKeys = await getApiKeys({ organizationId: session.activeOrganizationId });
      return c.json(apiKeys);
    } catch (error) {
      logger.error(error, "Failed to get api keys");
      return c.json({ error: "Internal server error" }, 500);
    }
  })
  .post("/", zValidator("json", z.object({ name: z.string().min(1) })), async (c) => {
    try {
      const { name } = c.req.valid("json");
      const { session } = await getUserSession(c);
      const newKey = await auth.api.createApiKey({
        body: {
          name,
        },
        headers: c.req.raw.headers,
      });

      await updateApiKeyOwner({ apiKeyId: newKey.id, organizationId: session.activeOrganizationId });

      return c.json({
        id: newKey.id,
        name: newKey.name,
        key: newKey.key,
      });
    } catch (error) {
      logger.error(error, "Failed to create api key");
      return c.json({ error: "Internal server error" }, 500);
    }
  })
  .delete("/:id", async (c) => {
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
  });

export { router as v1ApiKeyRouter };

export type ApiKeysRoutes = typeof router;
