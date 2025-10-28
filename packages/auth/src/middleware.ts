import { getAuthFromApiKey } from "@paperjet/db";
import { logger } from "@paperjet/shared";
import type { AuthContext } from "@paperjet/shared/types";
import type { Context, Next } from "hono";
import { auth } from "./auth";
import { matchesPattern } from "./util/pattern";

const publicRoutes = ["/api/health", "/api/auth/**"];

export const userAuthMiddleware = async (c: Context, next: Next) => {
  if (publicRoutes.some((pattern) => matchesPattern(c.req.path, pattern))) {
    return next();
  }

  const apiKey = c.req.header("x-api-key");

  if (apiKey) {
    const data = await auth.api.verifyApiKey({
      body: {
        key: apiKey,
      },
    });
    if (data.error) {
      logger.error(data.error, "API Key validation failed");
      return c.json({ message: "Unauthorized" }, 401);
    }
    if (!data.key) {
      logger.error(data.error, "API Key missing");
      return c.json({ message: "Unauthorized" }, 401);
    }
    const { userId, organizationId } = await getAuthFromApiKey({ apiKeyId: data.key.id });

    // TODO fetch plan info
    const authContext: AuthContext = {
      userId,
      organizationId,
      activePlan: "free",
      scope: "user",
    };
    c.set("context", authContext);
    return next();
  } else {
    const session = await auth.api.getSession({
      headers: c.req.raw.headers,
    });

    if (!session) {
      logger.info("missing auth");
      return c.json({ message: "Unauthorized" }, 401);
    }
    if (!session.session.activeOrganizationId) {
      logger.info("missing auth");
      return c.json({ message: "Unauthorized" }, 401);
    }
    const authContext: AuthContext = {
      userId: session.user.id,
      organizationId: session.session.activeOrganizationId,
      activePlan: "free",
      scope: "user",
    };
    c.set("context", authContext);
    return next();
  }
};

export const adminAuthMiddleware = async (c: Context, next: Next) => {
  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  });

  if (!session) {
    logger.info("missing auth");
    return c.json({ message: "Unauthorized" }, 401);
  }
  if (!session.session.activeOrganizationId) {
    logger.info("missing auth");
    return c.json({ message: "Unauthorized" }, 401);
  }
  if (!(session.user.role === "superadmin")) {
    logger.info("missing auth permissions");
    return c.json({ message: "Forbidden" }, 403);
  }
  const authContext: AuthContext = {
    userId: session.user.id,
    organizationId: session.session.activeOrganizationId,
    activePlan: "free",
    scope: "superadmin",
  };
  c.set("context", authContext);
  return next();
};

export const authHandler = async (c: Context) => {
  return auth.handler(c.req.raw);
};
