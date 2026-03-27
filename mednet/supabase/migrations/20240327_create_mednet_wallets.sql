-- Create mednet_wallets table to store Mednet system wallet balance
-- This table is separate from user wallets and stores Mednet's funds
CREATE TABLE IF NOT EXISTS mednet_wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    balance DECIMAL(15, 2) NOT NULL DEFAULT 0,
    currency VARCHAR(3) NOT NULL DEFAULT 'NGN',
    locked_balance DECIMAL(15, 2) NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
-- Add comment to document purpose
COMMENT ON TABLE mednet_wallets IS 'Stores Mednet system wallet balance separately from user wallets';