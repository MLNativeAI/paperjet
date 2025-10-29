ALTER TABLE "model_configuration" ADD COLUMN "is_core" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "model_configuration" ADD COLUMN "is_vision" boolean DEFAULT false NOT NULL;