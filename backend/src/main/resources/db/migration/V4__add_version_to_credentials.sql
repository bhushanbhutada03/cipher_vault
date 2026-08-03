-- Add missing optimistic locking version column to website_credentials
ALTER TABLE website_credentials
ADD COLUMN version BIGINT NOT NULL DEFAULT 0;
