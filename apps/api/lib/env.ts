import { z } from "zod";

const envSchema = z.object({
  BETTER_AUTH_SECRET: z.string().min(1, "BETTER_AUTH_SECRET is required"),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  S3_ENDPOINT: z.string().url("S3_ENDPOINT must be a valid URL"),
  S3_ACCESS_KEY: z.string().min(1, "S3_ACCESS_KEY is required"),
  S3_SECRET_KEY: z.string().min(1, "S3_SECRET_KEY is required"),
  S3_BUCKET: z.string().min(1, "S3_BUCKET is required"),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  PORT: z
    .string()
    .regex(/^\d+$/, "Port must be a numeric string")
    .default("3000")
    .transform(Number),
  ENVIRONMENT: z.enum(["dev", "prod"]).default("dev"),
  AXIOM_TOKEN: z.string(),
});

export const validateEnv = () => {
  const env = envSchema.safeParse(process.env);
  if (!env.success) {
    console.error("❌ Invalid environment configuration:", env.error.format());
    throw new Error("Invalid environment variables");
  }
  console.log("✅ Environment configuration is valid");
  return env.data;
};

export const envVars = validateEnv();

// Type augmentation for Bun
declare module "bun" {
  interface Env extends z.infer<typeof envSchema> {}
}
