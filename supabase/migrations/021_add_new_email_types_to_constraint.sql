-- ============================================
-- ADD NEW EMAIL TYPES TO CONSTRAINT
-- ============================================
-- This migration updates the valid_email_type constraint
-- to allow the new email types: welcome_email and profile_incomplete

-- Drop the old constraint
ALTER TABLE email_queue
DROP CONSTRAINT valid_email_type;

-- Add the updated constraint with all email types
ALTER TABLE email_queue
ADD CONSTRAINT valid_email_type CHECK (
  email_type IN (
    'application_received',
    'invitation_received',
    'application_accepted',
    'application_rejected',
    'daily_digest',
    'weekly_digest',
    'welcome_email',
    'profile_incomplete'
  )
);
