ALTER TABLE "workflow" ADD COLUMN "model_type" text DEFAULT 'fast' NOT NULL;--> statement-breakpoint
DROP TYPE "public"."modelType";--> statement-breakpoint
DROP TYPE "public"."structuredOutputMode";