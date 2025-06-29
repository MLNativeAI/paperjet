import pino from "pino";

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

// Default logger instance (can be overridden by apps)
export const logger = createLogger();
