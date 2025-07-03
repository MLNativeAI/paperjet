CREATE TABLE "workflow_sample" (
	"id" text PRIMARY KEY NOT NULL,
	"workflow_id" text NOT NULL,
	"file_id" text NOT NULL,
	"extracted_data" text NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"owner_id" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "workflow_sample" ADD CONSTRAINT "workflow_sample_workflow_id_workflow_id_fk" FOREIGN KEY ("workflow_id") REFERENCES "public"."workflow"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workflow_sample" ADD CONSTRAINT "workflow_sample_file_id_file_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."file"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workflow_sample" ADD CONSTRAINT "workflow_sample_owner_id_user_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;