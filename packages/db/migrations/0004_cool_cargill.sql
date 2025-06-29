-- First, add the new columns as nullable
ALTER TABLE "workflow_execution" ADD COLUMN "file_id" text;--> statement-breakpoint
ALTER TABLE "workflow_execution" ADD COLUMN "extraction_result" text;--> statement-breakpoint
ALTER TABLE "workflow_execution" ADD COLUMN "error_message" text;--> statement-breakpoint

-- Migrate data from execution_file to workflow_execution
-- For executions with multiple files, we'll keep the first file's data
UPDATE "workflow_execution" we
SET 
    file_id = ef.file_id,
    extraction_result = ef.extraction_result,
    error_message = ef.error_message
FROM (
    SELECT DISTINCT ON (execution_id) 
        execution_id,
        file_id,
        extraction_result,
        error_message
    FROM "execution_file"
    ORDER BY execution_id, created_at ASC
) ef
WHERE we.id = ef.execution_id;--> statement-breakpoint

-- Delete executions that don't have any files (orphaned executions)
DELETE FROM "workflow_execution"
WHERE id NOT IN (SELECT DISTINCT execution_id FROM "execution_file");--> statement-breakpoint

-- Now we can safely drop the execution_file table
ALTER TABLE "execution_file" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "execution_file" CASCADE;--> statement-breakpoint

-- Add NOT NULL constraint after data migration
ALTER TABLE "workflow_execution" ALTER COLUMN "file_id" SET NOT NULL;--> statement-breakpoint

-- Add foreign key constraint
ALTER TABLE "workflow_execution" ADD CONSTRAINT "workflow_execution_file_id_file_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."file"("id") ON DELETE cascade ON UPDATE no action;