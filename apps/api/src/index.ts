import { allWorkers } from "@paperjet/queue";
import { envVars, flushPosthog, logger } from "@paperjet/shared";
import "./instrumentation";
import { app } from "./routes";

const server = Bun.serve({
  port: envVars.PORT,
  hostname: "0.0.0.0",
  fetch: app.fetch,
  idleTimeout: 60,
});

process.on("SIGINT", async () => {
  await flushPosthog();
  process.exit(0);
});
process.on("SIGTERM", async () => {
  await flushPosthog();
  process.exit(0);
});

logger.info(`Started ${allWorkers.length} job workers`);

logger.info(
  {
    port: server.port,
    environment: envVars.ENVIRONMENT,
    hostname: "0.0.0.0",
  },
  `🚀 Server running on port ${server.port} in ${envVars.ENVIRONMENT} mode`,
);
