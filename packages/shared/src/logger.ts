import pino from "pino";
import { type EnvVars, envSchema } from "./env-schema";

const createLogger = () => {
  const transports = [];

  if (process.env.AXIOM_TOKEN && process.env.AXIOM_DATASET) {
    transports.push({
      target: "@axiomhq/pino",
      level: process.env.LOG_LEVEL || "debug",
      options: {
        dataset: process.env.AXIOM_DATASET,
        token: process.env.AXIOM_TOKEN,
      },
    });
  }

  if (process.env.ENVIRONMENT === "dev") {
    transports.push({
      target: "pino-pretty",
      level: process.env.LOG_LEVEL || "debug",
      options: {
        colorize: true,
        ignore: "pid,hostname,env",
        translateTime: "HH:MM:ss",
      },
    });
  }

  const injectContext = () => {
    // TODO restore this one day
    return {};
  };

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

// a small with putting this here to make sure that logger is initialized for env validation
export const validateEnv = (): EnvVars => {
  const env = envSchema.safeParse(process.env);
  if (!env.success) {
    logger.error(`❌ Invalid environment configuration: ${JSON.stringify(env.error.format())}`);
    throw new Error("Invalid environment variables");
  }
  logger.info("✅ Environment configuration is valid");
  return env.data;
};
