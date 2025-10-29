import type { EnvVars } from "./env-schema";
import { validateEnv } from "./logger";

// Validate environment variables
export const envVars = validateEnv();

// Type augmentation for Bun
declare module "bun" {
  interface Env extends EnvVars {}
}
