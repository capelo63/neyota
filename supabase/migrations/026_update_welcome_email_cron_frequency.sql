-- Migration: Update welcome email cron job to run every 10 minutes instead of every hour
-- This reduces the delay between email confirmation and welcome email delivery

-- Drop the existing cron job
SELECT cron.unschedule('send-welcome-emails-for-confirmed-users');

-- Reschedule with 10-minute frequency
SELECT cron.schedule(
  'send-welcome-emails-for-confirmed-users',
  '*/10 * * * *',  -- Every 10 minutes (was: '0 * * * *' = every hour at minute 0)
  $CRON$
    SELECT check_and_send_welcome_emails();
  $CRON$
);

-- Verify the new schedule
SELECT jobname, schedule, active
FROM cron.job
WHERE jobname = 'send-welcome-emails-for-confirmed-users';
