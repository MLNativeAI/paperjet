import { z } from "zod";

// Shared environment variable schema - used by API for validation and by shared logger for configuration
export const envSchema = z.object({
  OTEL_SERVICE_NAME: z.string().default("paperjet-api"),
  ML_SERVICE_URL: z.string().default("http://localhost:8000"),
  BASE_URL: z.string().default("http://localhost:5173"),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  S3_ENDPOINT: z.string().url("S3_ENDPOINT must be a valid URL"),
  S3_ACCESS_KEY: z.string().min(1, "S3_ACCESS_KEY is required"),
  S3_SECRET_KEY: z.string().min(1, "S3_SECRET_KEY is required"),
  S3_BUCKET: z.string().min(1, "S3_BUCKET is required"),
  PORT: z.string().regex(/^\d+$/, "Port must be a numeric string").default("3000").transform(Number),
  ENVIRONMENT: z.enum(["dev", "staging", "prod"]).default("dev"),

  // auth
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  MICROSOFT_CLIENT_ID: z.string().optional(),
  MICROSOFT_CLIENT_SECRET: z.string().optional(),
  BETTER_AUTH_SECRET: z.string().min(1, "BETTER_AUTH_SECRET is required"),
  RESEND_API_KEY: z.string().optional(),
  FROM_EMAIL: z.string().email("FROM_EMAIL must be a valid email address").default("noreply@getpaperjet.com"),
  SAAS_MODE: z
    .union([z.literal("true"), z.literal("false")])
    .transform((val) => val === "true")
    .default("false"),
  AUTH_MODE: z.enum(["magic-link", "password"]).default("password"),
  AXIOM_TOKEN: z.string().optional(),
  AXIOM_DATASET: z.string().default("paperjet"),

  // polar
  POLAR_ACCESS_TOKEN: z.string().optional(),
  POLAR_WEBHOOK_SECRET: z.string().optional(),
  POLAR_BASIC_PLAN_ID: z.string().optional(),
  POLAR_PRO_PLAN_ID: z.string().optional(),
});

// Export the inferred type for use across packages
export type EnvVars = z.infer<typeof envSchema>;

// Type augmentation for Bun - can be imported by API package
export interface BunEnvModule {
  Env: EnvVars;
}
