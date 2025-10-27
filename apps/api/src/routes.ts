import { otel } from "@hono/otel";
import { type auth, authHandler, requireAdmin, requireAuth } from "@paperjet/auth";
import { envVars, logger } from "@paperjet/shared";
import { Hono } from "hono";
import { serveStatic } from "hono/bun";
import { logger as honoLogger } from "hono/logger";
import { poweredBy } from "hono/powered-by";
import { openAPIRouteHandler } from "hono-openapi";
import { corsMiddleware } from "./lib/cors";
import { type InternalRoutes, internalRouter } from "./routes/internal";
import { type AdminRoutes, v1AdminRouter } from "./routes/v1/admin";
import { type ApiKeysRoutes, v1ApiKeyRouter } from "./routes/v1/api-keys";
import { type BillingRoutes, v1BillingRouter } from "./routes/v1/billing";
import { type ExecutionRoutes, v1ExecutionRouter } from "./routes/v1/executions";
import { v1WorkflowRouter, type WorkflowRoutes } from "./routes/v1/workflows";

export const app = new Hono<{
  Variables: {
    user: typeof auth.$Infer.Session.user | null;
    session: typeof auth.$Infer.Session.session | null;
  };
}>();

app.use("*", otel());
app.use(poweredBy({ serverName: "mlnative.com" }));
app.use(
  honoLogger((message) => {
    logger.trace(message);
  }),
);
app.use("/api/*", corsMiddleware);
app.use("/api/v1/*", requireAuth);
app.use("/api/v1/admin/*", requireAdmin);
app.on(["POST", "GET"], "/api/auth/*", authHandler);

app.get("/api/health", async (c) => {
  logger.info({ endpoint: "/api/health", method: "GET" }, "health check");
  return c.json({
    status: "ok",
  });
});

app
  .basePath("/api")
  .route("/internal", internalRouter)
  .route("/v1/admin", v1AdminRouter)
  .route("/v1/billing", v1BillingRouter)
  .route("/v1/api-keys", v1ApiKeyRouter)
  .route("/v1/workflows", v1WorkflowRouter)
  .route("/v1/executions", v1ExecutionRouter);

app.get(
  "/openapi",
  openAPIRouteHandler(app, {
    documentation: {
      info: {
        title: "PaperJet API",
        version: "1.0.0",
        description: "Secure document extraction API",
      },
      components: {
        securitySchemes: {
          bearerAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT",
          },
        },
      },
      security: [
        {
          bearerAuth: [],
        },
      ],
      servers: [{ url: "https://app.getpaperjet.com", description: "Production Server" }],
    },
  }),
);

if (process.env.NODE_ENV === "production") {
  // Serve all static files from the dist directory
  app.use("*", serveStatic({ root: "./dist" }));

  // Serve index.html for all other routes (SPA fallback)
  app.get("*", serveStatic({ path: "./dist/index.html" }));
} else {
  app.get("*", (c) => {
    return c.redirect(envVars.BASE_URL);
  });
}

export type { AdminRoutes, ApiKeysRoutes, BillingRoutes, ExecutionRoutes, InternalRoutes, WorkflowRoutes };
