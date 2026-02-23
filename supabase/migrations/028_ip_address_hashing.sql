-- Migration 028: Store hashed IPs instead of raw IPs in charter acceptances
--
-- Motivation: Raw IPv4/IPv6 addresses are personal data under GDPR.
-- Storing a SHA-256 hash (computed in the application layer) prevents
-- direct re-identification while preserving the audit trail.
--
-- The application layer (app/api/get-client-ip/route.ts) now returns
-- a SHA-256 hex digest (64 chars) instead of the raw address.
-- We must change the column type from INET to TEXT to accommodate hashes.

-- Change ip_address column from INET to TEXT
ALTER TABLE user_charter_acceptances
  ALTER COLUMN ip_address TYPE TEXT;

-- Add a comment documenting the new format
COMMENT ON COLUMN user_charter_acceptances.ip_address IS
  'SHA-256 hash of the client IP at acceptance time (hex, 64 chars). '
  'Raw IP is never stored — hashed in the API layer before insertion.';
