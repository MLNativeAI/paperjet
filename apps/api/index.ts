import { Hono } from "hono";
import { serveStatic } from "hono/bun";
import { logger } from "hono/logger";
import { poweredBy } from "hono/powered-by";
import { type auth, authHandler, requireAuth } from "./lib/auth";
import { corsMiddleware } from "./lib/cors";
import { envVars } from "./lib/env";
import files from "./routes/files";
import workflows from "./routes/workflows";

import { otel } from "@hono/otel";
import { NodeSDK } from "@opentelemetry/sdk-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { OTLPLogExporter } from "@opentelemetry/exporter-logs-otlp-http";
import { LoggerProvider, SimpleLogRecordProcessor, ConsoleLogRecordExporter } from "@opentelemetry/sdk-logs";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { logs } from "@opentelemetry/api-logs";

const traceExporter = new OTLPTraceExporter({
  url: "https://api.axiom.co/v1/traces",
  headers: {
    "Authorization": `Bearer ${envVars.AXIOM_TOKEN}`,
    "X-Axiom-Dataset": "paperjet",
  },
})

const logExporter = new OTLPLogExporter({
  url: "https://api.axiom.co/v1/logs",
  headers: {
    "Authorization": `Bearer ${envVars.AXIOM_TOKEN}`,
    "X-Axiom-Dataset": "paperjet",
  },
});

// Create and configure LoggerProvider
const loggerProvider = new LoggerProvider();
loggerProvider.addLogRecordProcessor(new SimpleLogRecordProcessor(logExporter));

// Also add console exporter for development
if (envVars.ENVIRONMENT === "dev") {
  loggerProvider.addLogRecordProcessor(new SimpleLogRecordProcessor(new ConsoleLogRecordExporter()));
}

// Set the global logger provider
logs.setGlobalLoggerProvider(loggerProvider);

const sdk = new NodeSDK({
  traceExporter: traceExporter,
  logRecordProcessor: new SimpleLogRecordProcessor(logExporter),
  instrumentations: [getNodeAutoInstrumentations()],
});

sdk.start();


const app = new Hono<{
  Variables: {
    user: typeof auth.$Infer.Session.user | null;
    session: typeof auth.$Infer.Session.session | null;
  };
}>();

app.use('*', otel())
app.use(poweredBy({ serverName: "mlnative.com" }));
app.use(logger());
// Cors middleware for local development
app.use("/api/*", corsMiddleware);
// Require authentication for all API routes
app.use("/api/*", requireAuth);
// BetterAuth handler
app.on(["POST", "GET"], "/api/auth/*", authHandler);

// Health check
app.get("/api/health", async (c) => {
  console.log("health check");
  return c.json({
    status: "ok",
  });
});

export const apiRoutes = app
  .basePath("/api")
  .route("/files", files)
  .route("/workflows", workflows);

if (envVars.ENVIRONMENT === "prod") {
  // Serve static files
  app.get("*", serveStatic({ root: "./public" }));
  app.get("*", serveStatic({ path: "./public/index.html" }));
} else {
  app.get("*", (c) => {
    return c.redirect("http://localhost:5173");
  });
}

const server = Bun.serve({
  port: envVars.PORT,
  hostname: "0.0.0.0",
  fetch: app.fetch,
});

console.log(
  `🚀 Server running on port ${server.port} in ${envVars.ENVIRONMENT} mode`,
);

export type ApiRoutes = typeof apiRoutes;
