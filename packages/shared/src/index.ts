// Shared types and utilities for both frontend and backend

export const APP_NAME = "Hono React App";

// Common interfaces
export interface User {
    id: string;
    name: string;
    email: string;
}

export type ApiResponse<T> = {
    success: boolean;
    data?: T;
    error?: string;
};

// Export environment schema and types
export { type BunEnvModule, type EnvVars, envSchema } from "./env-schema";
// Export logger utilities
export { createLogger, getLogger, initializeLogger, type LoggerConfig, logger } from "./logger";
