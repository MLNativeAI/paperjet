ALTER TABLE "model_configuration" ALTER COLUMN "provider" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "model_configuration" ALTER COLUMN "model_name" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "model_configuration" ALTER COLUMN "display_name" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "file" ADD COLUMN "mime_type" text DEFAULT 'application/pdf' NOT NULL;--> statement-breakpoint
ALTER TABLE "file" ADD COLUMN "file_type" text DEFAULT 'document' NOT NULL;