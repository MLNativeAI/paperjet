import pino from "pino";
import { ExecutionContext } from "./context";

const createLogger = () => {
  const transports = [];

  if (process.env.AXIOM_TOKEN && process.env.AXIOM_DATASET) {
    transports.push({
      target: "@axiomhq/pino",
      options: {
        dataset: process.env.AXIOM_DATASET,
        token: process.env.AXIOM_TOKEN,
      },
    });
  }

  if (process.env.ENVIRONMENT === "dev") {
    transports.push({
      target: "pino-pretty",
      options: {
        colorize: true,
        ignore: "pid,hostname,env",
        translateTime: "HH:MM:ss",
      },
    });
  }

  const injectContext = () => {
    if (process.env.NODE_ENV === "production") {
      const context = ExecutionContext.get();
      return context || {};
    }
    return {};
  }

  const rootLogger = pino(
    {
      level: process.env.LOG_LEVEL || "debug",
      mixin: injectContext,
    },
    transports.length > 0
      ? pino.transport({
          targets: transports,
        })
      : undefined,
  );

  return rootLogger.child({
    env: process.env.ENVIRONMENT,
    baseUrl: process.env.BASE_URL,
  });
};

export const logger = createLogger();
