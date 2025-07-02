import { type EnvVars, envSchema, initializeLogger } from "@paperjet/shared";

export const validateEnv = (): EnvVars => {
    const env = envSchema.safeParse(process.env);
    if (!env.success) {
        console.error("❌ Invalid environment configuration:", env.error.format());
        throw new Error("Invalid environment variables");
    }
    console.log("✅ Environment configuration is valid");
    return env.data;
};

// Validate environment variables
export const envVars = validateEnv();

// Initialize the shared logger with validated environment variables
export const logger = initializeLogger(envVars);

// Type augmentation for Bun
declare module "bun" {
    interface Env extends EnvVars {}
}
