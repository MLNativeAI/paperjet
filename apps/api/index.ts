// Initialize OpenTelemetry instrumentation first
import "./instrumentation";

import { otel } from "@hono/otel";
import { logger } from "@paperjet/shared";
import { Hono } from "hono";
import { serveStatic } from "hono/bun";
import { logger as honoLogger } from "hono/logger";
import { poweredBy } from "hono/powered-by";
import { type auth, authHandler, requireAuth } from "./lib/auth";
import { corsMiddleware } from "./lib/cors";
import { envVars } from "./lib/env";
import executions from "./routes/executions";
import workflows from "./routes/workflows";

const app = new Hono<{
    Variables: {
        user: typeof auth.$Infer.Session.user | null;
        session: typeof auth.$Infer.Session.session | null;
    };
}>();

app.use("*", otel());
app.use(poweredBy({ serverName: "mlnative.com" }));
app.use(honoLogger());
// Cors middleware for local development
app.use("/api/*", corsMiddleware);
// Require authentication for all API routes
app.use("/api/*", requireAuth);
// BetterAuth handler
app.on(["POST", "GET"], "/api/auth/*", authHandler);

// Health check
app.get("/api/health", async (c) => {
    logger.info({ endpoint: "/api/health", method: "GET" }, "health check");
    return c.json({
        status: "ok",
    });
});

export const apiRoutes = app.basePath("/api").route("/workflows", workflows).route("/executions", executions);

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

const server = Bun.serve({
    port: envVars.PORT,
    hostname: "0.0.0.0",
    fetch: app.fetch,
});

logger.info(
    {
        port: server.port,
        environment: envVars.ENVIRONMENT,
        hostname: "0.0.0.0",
    },
    `🚀 Server running on port ${server.port} in ${envVars.ENVIRONMENT} mode`,
);

export type ApiRoutes = typeof apiRoutes;
