ALTER TABLE "document_data" DROP CONSTRAINT "document_data_owner_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "file" DROP CONSTRAINT "file_owner_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "workflow" DROP CONSTRAINT "workflow_owner_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "workflow_execution" DROP CONSTRAINT "workflow_execution_owner_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "document_data" ADD CONSTRAINT "document_data_owner_id_organization_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "file" ADD CONSTRAINT "file_owner_id_organization_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workflow" ADD CONSTRAINT "workflow_owner_id_organization_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workflow_execution" ADD CONSTRAINT "workflow_execution_owner_id_organization_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;