-- Update all existing workflows to 'active' status
UPDATE "workflow" SET "status" = 'active' WHERE "status" = 'draft';