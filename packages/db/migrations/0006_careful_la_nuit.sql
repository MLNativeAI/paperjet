ALTER TABLE "apikey" ADD COLUMN "organization_id" text;--> statement-breakpoint
ALTER TABLE "usage_data" ADD COLUMN "organization_id" text;--> statement-breakpoint
ALTER TABLE "workflow" ADD COLUMN "creator_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "workflow_execution" ADD COLUMN "creator_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "apikey" ADD CONSTRAINT "apikey_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workflow" ADD CONSTRAINT "workflow_creator_id_user_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workflow_execution" ADD CONSTRAINT "workflow_execution_creator_id_user_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;