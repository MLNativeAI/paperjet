ALTER TABLE "usage_data" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "usage_model_price" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "usage_data" CASCADE;--> statement-breakpoint
DROP TABLE "usage_model_price" CASCADE;--> statement-breakpoint
ALTER TABLE "runtime_configuration" RENAME COLUMN "accurate_model_id" TO "core_model_id";--> statement-breakpoint
ALTER TABLE "runtime_configuration" RENAME COLUMN "fast_model_id" TO "vision_model_id";--> statement-breakpoint
ALTER TABLE "runtime_configuration" DROP CONSTRAINT "runtime_configuration_accurate_model_id_model_configuration_id_fk";
--> statement-breakpoint
ALTER TABLE "runtime_configuration" DROP CONSTRAINT "runtime_configuration_fast_model_id_model_configuration_id_fk";
--> statement-breakpoint
ALTER TABLE "runtime_configuration" ADD CONSTRAINT "runtime_configuration_core_model_id_model_configuration_id_fk" FOREIGN KEY ("core_model_id") REFERENCES "public"."model_configuration"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "runtime_configuration" ADD CONSTRAINT "runtime_configuration_vision_model_id_model_configuration_id_fk" FOREIGN KEY ("vision_model_id") REFERENCES "public"."model_configuration"("id") ON DELETE no action ON UPDATE no action;