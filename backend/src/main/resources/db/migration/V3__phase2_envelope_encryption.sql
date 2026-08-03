-- Add Envelope Encryption fields to users
ALTER TABLE users 
ADD COLUMN encrypted_dek_master VARCHAR(255) NULL,
ADD COLUMN encrypted_dek_recovery VARCHAR(255) NULL,
ADD COLUMN token_version INT NOT NULL DEFAULT 0;

-- Add immutable UUID for AAD binding
ALTER TABLE website_credentials
ADD COLUMN credential_uuid CHAR(36) NULL;

-- Populate UUIDs for existing legacy credentials
UPDATE website_credentials SET credential_uuid = UUID() WHERE credential_uuid IS NULL;

-- Enforce strict constraints on the UUID
ALTER TABLE website_credentials
MODIFY COLUMN credential_uuid CHAR(36) NOT NULL,
ADD UNIQUE INDEX idx_credential_uuid (credential_uuid);
