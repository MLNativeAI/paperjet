-- Migration to convert existing UUID records to prefixed IDs
-- This migration handles the transition from UUIDs to prefixed IDs

-- Create a function to convert UUID to prefixed ID
CREATE OR REPLACE FUNCTION uuid_to_prefixed_id(uuid_val text, prefix text) 
RETURNS text AS $$
BEGIN
    -- Remove hyphens from UUID and take first 12 characters, then add prefix
    RETURN prefix || '_' || substring(replace(uuid_val, '-', ''), 1, 12);
END;
$$ LANGUAGE plpgsql;--> statement-breakpoint

-- Disable foreign key checks temporarily to allow ID updates
ALTER TABLE "workflow_file" DROP CONSTRAINT IF EXISTS "workflow_file_workflow_id_workflow_id_fk";--> statement-breakpoint
ALTER TABLE "workflow_file" DROP CONSTRAINT IF EXISTS "workflow_file_file_id_file_id_fk";--> statement-breakpoint
ALTER TABLE "workflow_execution" DROP CONSTRAINT IF EXISTS "workflow_execution_workflow_id_workflow_id_fk";--> statement-breakpoint
ALTER TABLE "workflow_execution" DROP CONSTRAINT IF EXISTS "workflow_execution_file_id_file_id_fk";--> statement-breakpoint
ALTER TABLE "workflow_execution" DROP CONSTRAINT IF EXISTS "workflow_execution_owner_id_user_id_fk";--> statement-breakpoint
ALTER TABLE "workflow" DROP CONSTRAINT IF EXISTS "workflow_owner_id_user_id_fk";--> statement-breakpoint
ALTER TABLE "file" DROP CONSTRAINT IF EXISTS "file_owner_id_user_id_fk";--> statement-breakpoint
ALTER TABLE "session" DROP CONSTRAINT IF EXISTS "session_user_id_user_id_fk";--> statement-breakpoint
ALTER TABLE "account" DROP CONSTRAINT IF EXISTS "account_user_id_user_id_fk";--> statement-breakpoint

-- Create temporary mapping tables to store old-to-new ID mappings
CREATE TEMP TABLE user_id_mapping AS
SELECT id as old_id, uuid_to_prefixed_id(id, 'usr') as new_id FROM "user";--> statement-breakpoint

CREATE TEMP TABLE file_id_mapping AS
SELECT id as old_id, uuid_to_prefixed_id(id, 'fil') as new_id FROM "file";--> statement-breakpoint

CREATE TEMP TABLE workflow_id_mapping AS
SELECT id as old_id, uuid_to_prefixed_id(id, 'wkf') as new_id FROM "workflow";--> statement-breakpoint

CREATE TEMP TABLE session_id_mapping AS
SELECT id as old_id, uuid_to_prefixed_id(id, 'ses') as new_id FROM "session";--> statement-breakpoint

CREATE TEMP TABLE account_id_mapping AS
SELECT id as old_id, uuid_to_prefixed_id(id, 'acc') as new_id FROM "account";--> statement-breakpoint

CREATE TEMP TABLE verification_id_mapping AS
SELECT id as old_id, uuid_to_prefixed_id(id, 'ver') as new_id FROM "verification";--> statement-breakpoint

CREATE TEMP TABLE workflow_execution_id_mapping AS
SELECT id as old_id, uuid_to_prefixed_id(id, 'run') as new_id FROM "workflow_execution";--> statement-breakpoint

CREATE TEMP TABLE workflow_file_id_mapping AS
SELECT id as old_id, uuid_to_prefixed_id(id, 'wfl') as new_id FROM "workflow_file";--> statement-breakpoint

-- Update user table
UPDATE "user" SET id = (SELECT new_id FROM user_id_mapping WHERE old_id = "user".id);--> statement-breakpoint

-- Update file table with new IDs and owner references
UPDATE "file" SET 
    id = (SELECT new_id FROM file_id_mapping WHERE old_id = "file".id),
    owner_id = (SELECT new_id FROM user_id_mapping WHERE old_id = "file".owner_id);--> statement-breakpoint

-- Update workflow table with new IDs and owner references
UPDATE "workflow" SET 
    id = (SELECT new_id FROM workflow_id_mapping WHERE old_id = "workflow".id),
    owner_id = (SELECT new_id FROM user_id_mapping WHERE old_id = "workflow".owner_id);--> statement-breakpoint

-- Update session table with new IDs and user references
UPDATE "session" SET 
    id = (SELECT new_id FROM session_id_mapping WHERE old_id = "session".id),
    user_id = (SELECT new_id FROM user_id_mapping WHERE old_id = "session".user_id);--> statement-breakpoint

-- Update account table with new IDs and user references
UPDATE "account" SET 
    id = (SELECT new_id FROM account_id_mapping WHERE old_id = "account".id),
    user_id = (SELECT new_id FROM user_id_mapping WHERE old_id = "account".user_id);--> statement-breakpoint

-- Update verification table with new IDs
UPDATE "verification" SET 
    id = (SELECT new_id FROM verification_id_mapping WHERE old_id = "verification".id);--> statement-breakpoint

-- Update workflow_execution table with new IDs and references
UPDATE "workflow_execution" SET 
    id = (SELECT new_id FROM workflow_execution_id_mapping WHERE old_id = "workflow_execution".id),
    workflow_id = (SELECT new_id FROM workflow_id_mapping WHERE old_id = "workflow_execution".workflow_id),
    file_id = (SELECT new_id FROM file_id_mapping WHERE old_id = "workflow_execution".file_id),
    owner_id = (SELECT new_id FROM user_id_mapping WHERE old_id = "workflow_execution".owner_id);--> statement-breakpoint

-- Update workflow_file table with new IDs and references
UPDATE "workflow_file" SET 
    id = (SELECT new_id FROM workflow_file_id_mapping WHERE old_id = "workflow_file".id),
    workflow_id = (SELECT new_id FROM workflow_id_mapping WHERE old_id = "workflow_file".workflow_id),
    file_id = (SELECT new_id FROM file_id_mapping WHERE old_id = "workflow_file".file_id);--> statement-breakpoint

-- Re-enable foreign key constraints
ALTER TABLE "workflow_file" ADD CONSTRAINT "workflow_file_workflow_id_workflow_id_fk" FOREIGN KEY ("workflow_id") REFERENCES "public"."workflow"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workflow_file" ADD CONSTRAINT "workflow_file_file_id_file_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."file"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workflow_execution" ADD CONSTRAINT "workflow_execution_workflow_id_workflow_id_fk" FOREIGN KEY ("workflow_id") REFERENCES "public"."workflow"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workflow_execution" ADD CONSTRAINT "workflow_execution_file_id_file_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."file"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workflow_execution" ADD CONSTRAINT "workflow_execution_owner_id_user_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workflow" ADD CONSTRAINT "workflow_owner_id_user_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "file" ADD CONSTRAINT "file_owner_id_user_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint

-- Clean up: Drop the helper function
DROP FUNCTION IF EXISTS uuid_to_prefixed_id(text, text);--> statement-breakpoint