import pino from 'pino';
import { envVars } from './env';

export const rootLogger = pino(
  { level: 'info' },
  envVars.AXIOM_TOKEN ?
    pino.transport({
      target: '@axiomhq/pino',
      options: {
        dataset: envVars.AXIOM_DATASET,
        token: envVars.AXIOM_TOKEN,
      },
    }) : undefined,
);

export const logger = rootLogger.child({
  env: envVars.ENVIRONMENT,
  baseUrl: envVars.BASE_URL,
})