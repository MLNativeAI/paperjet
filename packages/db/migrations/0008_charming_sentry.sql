ALTER TABLE "runtime_configuration" RENAME COLUMN "model_id" TO "fast_model_id";--> statement-breakpoint
ALTER TABLE "runtime_configuration" DROP CONSTRAINT "runtime_configuration_model_id_model_configuration_id_fk";
--> statement-breakpoint
ALTER TABLE "runtime_configuration" ADD COLUMN "accurate_model_id" text;--> statement-breakpoint
ALTER TABLE "runtime_configuration" ADD CONSTRAINT "runtime_configuration_accurate_model_id_model_configuration_id_fk" FOREIGN KEY ("accurate_model_id") REFERENCES "public"."model_configuration"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "runtime_configuration" ADD CONSTRAINT "runtime_configuration_fast_model_id_model_configuration_id_fk" FOREIGN KEY ("fast_model_id") REFERENCES "public"."model_configuration"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "model_configuration" DROP COLUMN "structuredOutputMode";