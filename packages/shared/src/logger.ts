import pino from "pino";
import type { EnvVars } from "./env-schema";

export interface LoggerConfig {
    level?: string;
    environment?: string;
    baseUrl?: string;
    axiomToken?: string;
    axiomDataset?: string;
}

export function createLogger(config: LoggerConfig = {}) {
    const { level = "info", environment, baseUrl, axiomToken, axiomDataset = "paperjet" } = config;

    const rootLogger = pino(
        { level },
        axiomToken
            ? pino.transport({
                  target: "@axiomhq/pino",
                  options: {
                      dataset: axiomDataset,
                      token: axiomToken,
                  },
              })
            : undefined,
    );

    return rootLogger.child({
        env: environment,
        baseUrl,
    });
}

// Singleton logger instance - initialized by the main app with validated env vars
let loggerInstance: ReturnType<typeof createLogger> | null = null;

export function initializeLogger(envVars: EnvVars) {
    if (loggerInstance) {
        return loggerInstance;
    }

    loggerInstance = createLogger({
        level: envVars.ENVIRONMENT === "dev" ? "debug" : "info",
        environment: envVars.ENVIRONMENT,
        baseUrl: envVars.BASE_URL,
        axiomToken: envVars.AXIOM_TOKEN,
        axiomDataset: envVars.AXIOM_DATASET,
    });

    return loggerInstance;
}

export function getLogger() {
    if (!loggerInstance) {
        // Fallback logger for cases where initialization hasn't happened yet
        console.warn("Logger not initialized yet, using fallback logger");
        return createLogger();
    }
    return loggerInstance;
}

// Export the logger instance getter for convenience
export const logger = new Proxy({} as ReturnType<typeof createLogger>, {
    get(target, prop) {
        return getLogger()[prop as keyof ReturnType<typeof createLogger>];
    }
});
