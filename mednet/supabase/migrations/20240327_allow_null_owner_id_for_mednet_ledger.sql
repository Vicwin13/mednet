-- Allow NULL owner_id for mednet ledger entries
-- For mednet system entries, owner_id should be NULL since owner_type is used to identify them
-- This is needed because mednet entries don't have a specific UUID owner
ALTER TABLE ledger
ALTER COLUMN owner_id DROP NOT NULL;
-- Add comment to document the change
COMMENT ON COLUMN ledger.owner_id IS 'Can be NULL for mednet system entries (owner_type = "mednet")';