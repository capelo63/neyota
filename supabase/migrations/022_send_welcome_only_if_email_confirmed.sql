-- ============================================
-- SEND WELCOME EMAIL ONLY IF EMAIL IS CONFIRMED
-- ============================================
-- This migration modifies the welcome email system to only send
-- the welcome email after the user has confirmed their email address

-- Drop the old trigger that sends welcome email immediately
DROP TRIGGER IF EXISTS send_welcome_email_trigger ON profiles;
DROP FUNCTION IF EXISTS send_welcome_email();

-- Create a function to check and send welcome emails for confirmed users
CREATE OR REPLACE FUNCTION check_and_send_welcome_emails()
RETURNS INTEGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  v_profile RECORD;
  v_user_email TEXT;
  v_sent_count INTEGER := 0;
BEGIN
  -- Loop through profiles created in the last 7 days
  -- that haven't received a welcome email yet
  FOR v_profile IN
    SELECT p.id, p.full_name, p.role, p.created_at, au.email, au.email_confirmed_at
    FROM profiles p
    JOIN auth.users au ON au.id = p.id
    WHERE
      p.created_at >= NOW() - INTERVAL '7 days'
      AND au.email_confirmed_at IS NOT NULL  -- Email must be confirmed
      AND NOT EXISTS (
        -- Check if welcome email was already sent
        SELECT 1 FROM email_queue
        WHERE user_id = p.id
        AND email_type = 'welcome_email'
        AND status IN ('sent', 'pending')
      )
  LOOP
    -- Queue welcome email
    PERFORM queue_email(
      p_user_id := v_profile.id,
      p_email_type := 'welcome_email',
      p_subject := 'Bienvenue sur NEYOTA ! 🎉',
      p_template_params := jsonb_build_object(
        'user_name', COALESCE(SPLIT_PART(v_profile.full_name, ' ', 1), 'nouveau membre'),
        'user_role', v_profile.role,
        'profile_id', v_profile.id
      )
    );

    v_sent_count := v_sent_count + 1;
  END LOOP;

  RETURN v_sent_count;
END;
$$;

-- Create a cron job to check for confirmed emails every hour
-- This will send welcome emails to users who just confirmed their email
SELECT cron.schedule(
  'send-welcome-emails-for-confirmed-users',
  '0 * * * *', -- Every hour at minute 0
  $CRON$
    SELECT check_and_send_welcome_emails();
  $CRON$
);

-- Add a comment
COMMENT ON FUNCTION check_and_send_welcome_emails() IS
'Checks for recently created profiles with confirmed emails and sends them a welcome email if they haven''t received one yet. Runs hourly via cron job.';
