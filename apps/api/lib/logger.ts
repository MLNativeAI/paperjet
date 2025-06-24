import pino from 'pino';
import { envVars } from './env';

export const logger = pino(
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