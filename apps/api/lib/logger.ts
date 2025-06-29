import { createLogger } from "@paperjet/shared";
import { envVars } from "./env";

export const logger = createLogger({
    level: "info",
    environment: envVars.ENVIRONMENT,
    baseUrl: envVars.BASE_URL,
    axiomToken: envVars.AXIOM_TOKEN,
    axiomDataset: envVars.AXIOM_DATASET,
});
