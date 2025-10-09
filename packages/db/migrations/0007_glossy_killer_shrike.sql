CREATE TABLE "runtime_configuration" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"model_id" text
);
--> statement-breakpoint
ALTER TABLE "configuration" RENAME TO "model_configuration";--> statement-breakpoint
ALTER TABLE "model_configuration" ADD COLUMN "provider" text;--> statement-breakpoint
ALTER TABLE "model_configuration" ADD COLUMN "provider_api_key" text;--> statement-breakpoint
ALTER TABLE "model_configuration" ADD COLUMN "model_name" text;--> statement-breakpoint
ALTER TABLE "model_configuration" ADD COLUMN "display_name" text;--> statement-breakpoint
ALTER TABLE "model_configuration" ADD COLUMN "base_url" text;--> statement-breakpoint
ALTER TABLE "runtime_configuration" ADD CONSTRAINT "runtime_configuration_model_id_model_configuration_id_fk" FOREIGN KEY ("model_id") REFERENCES "public"."model_configuration"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "model_configuration" DROP COLUMN "modelType";--> statement-breakpoint
ALTER TABLE "model_configuration" DROP COLUMN "gemini_api_key";--> statement-breakpoint
ALTER TABLE "model_configuration" DROP COLUMN "custom_model_url";--> statement-breakpoint
ALTER TABLE "model_configuration" DROP COLUMN "custom_model_name";--> statement-breakpoint
ALTER TABLE "model_configuration" DROP COLUMN "custom_model_token";