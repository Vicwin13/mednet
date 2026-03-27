-- Remove the check constraint that was blocking mednet ledger entries
-- The previous migration dropped the NOT NULL constraint on owner_id,
-- but there's still a CHECK constraint preventing mednet entries
-- Drop the check constraint
ALTER TABLE ledger DROP CONSTRAINT ledger_owner_type_check;