-- Add optimistic locking version column and kdf_salt for V2 Encryption
ALTER TABLE users 
ADD COLUMN version BIGINT NOT NULL DEFAULT 0,
ADD COLUMN kdf_salt VARBINARY(32) NULL;
