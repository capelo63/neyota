-- ============================================
-- EMAIL NOTIFICATION SYSTEM WITH BREVO
-- ============================================
-- This migration creates the infrastructure for email notifications
-- using Brevo (formerly Sendinblue) as the email service provider

-- ============================================
-- EMAIL PREFERENCES TABLE
-- ============================================
-- Stores user preferences for email notifications

CREATE TABLE email_preferences (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,

  -- Digest settings
  digest_frequency TEXT NOT NULL DEFAULT 'weekly',
  -- Options: 'daily', 'weekly', 'never'

  -- Instant email notifications (sent immediately)
  instant_application_received BOOLEAN NOT NULL DEFAULT true,
  -- Email when someone applies to my project

  instant_invitation_received BOOLEAN NOT NULL DEFAULT true,
  -- Email when I receive an invitation to a project

  instant_application_status BOOLEAN NOT NULL DEFAULT true,
  -- Email when my application is accepted/rejected

  -- Recommendations in digest
  recommendations_in_digest BOOLEAN NOT NULL DEFAULT true,
  -- Include automatic recommendations in digest emails

  -- Global opt-out
  emails_enabled BOOLEAN NOT NULL DEFAULT true,
  -- Master switch to disable all emails

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Constraints
  CONSTRAINT valid_digest_frequency CHECK (
    digest_frequency IN ('daily', 'weekly', 'never')
  )
);

-- Create index for efficient queries
CREATE INDEX idx_email_preferences_digest_frequency
  ON email_preferences(digest_frequency)
  WHERE emails_enabled = true;

-- Enable RLS
ALTER TABLE email_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own email preferences"
  ON email_preferences
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update their own email preferences"
  ON email_preferences
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can insert their own email preferences"
  ON email_preferences
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- ============================================
-- EMAIL QUEUE TABLE
-- ============================================
-- Queue for emails to be sent (for both instant and digest emails)

CREATE TABLE email_queue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Recipient
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  recipient_email TEXT NOT NULL,
  recipient_name TEXT NOT NULL,

  -- Email details
  email_type TEXT NOT NULL,
  -- Options: 'application_received', 'invitation_received', 'application_accepted',
  --          'application_rejected', 'daily_digest', 'weekly_digest'

  subject TEXT NOT NULL,
  template_id INTEGER, -- Brevo template ID (if using templates)

  -- Template parameters (JSON object with dynamic data)
  template_params JSONB NOT NULL DEFAULT '{}'::jsonb,

  -- HTML content (alternative to template_id)
  html_content TEXT,

  -- Status
  status TEXT NOT NULL DEFAULT 'pending',
  -- Options: 'pending', 'sent', 'failed', 'cancelled'

  -- Sending details
  scheduled_for TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  sent_at TIMESTAMP WITH TIME ZONE,

  -- Error tracking
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,

  -- Related entities (for tracking and linking)
  related_project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  related_application_id UUID REFERENCES applications(id) ON DELETE SET NULL,
  related_notification_id UUID REFERENCES notifications(id) ON DELETE SET NULL,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Constraints
  CONSTRAINT valid_email_type CHECK (
    email_type IN (
      'application_received',
      'invitation_received',
      'application_accepted',
      'application_rejected',
      'daily_digest',
      'weekly_digest'
    )
  ),
  CONSTRAINT valid_status CHECK (
    status IN ('pending', 'sent', 'failed', 'cancelled')
  )
);

-- Indexes for efficient queries
CREATE INDEX idx_email_queue_status_scheduled
  ON email_queue(status, scheduled_for)
  WHERE status = 'pending';

CREATE INDEX idx_email_queue_user_id
  ON email_queue(user_id);

CREATE INDEX idx_email_queue_created_at
  ON email_queue(created_at DESC);

-- Enable RLS
ALTER TABLE email_queue ENABLE ROW LEVEL SECURITY;

-- RLS Policies (restrictive - only system functions can access)
CREATE POLICY "Service role can manage email queue"
  ON email_queue
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Users can only view their own queued emails (for transparency)
CREATE POLICY "Users can view their own queued emails"
  ON email_queue
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to create default email preferences for new users
CREATE OR REPLACE FUNCTION create_default_email_preferences()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO email_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create default preferences when a user signs up
DROP TRIGGER IF EXISTS trigger_create_default_email_preferences ON profiles;
CREATE TRIGGER trigger_create_default_email_preferences
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION create_default_email_preferences();

-- Function to add email to queue
CREATE OR REPLACE FUNCTION queue_email(
  p_user_id UUID,
  p_email_type TEXT,
  p_subject TEXT,
  p_template_params JSONB DEFAULT '{}'::jsonb,
  p_related_project_id UUID DEFAULT NULL,
  p_related_application_id UUID DEFAULT NULL,
  p_related_notification_id UUID DEFAULT NULL,
  p_scheduled_for TIMESTAMP WITH TIME ZONE DEFAULT NOW()
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  email_id UUID;
  user_email TEXT;
  user_name TEXT;
  user_prefs RECORD;
BEGIN
  -- Get user email and name
  SELECT email, first_name || ' ' || COALESCE(last_name, '')
  INTO user_email, user_name
  FROM auth.users au
  JOIN profiles p ON au.id = p.id
  WHERE p.id = p_user_id;

  -- Get user email preferences
  SELECT * INTO user_prefs
  FROM email_preferences
  WHERE user_id = p_user_id;

  -- If no preferences found, create defaults
  IF user_prefs.user_id IS NULL THEN
    INSERT INTO email_preferences (user_id)
    VALUES (p_user_id)
    RETURNING * INTO user_prefs;
  END IF;

  -- Check if emails are globally disabled
  IF user_prefs.emails_enabled = false THEN
    RETURN NULL; -- Don't queue email
  END IF;

  -- Check specific preferences based on email type
  IF p_email_type = 'application_received' AND user_prefs.instant_application_received = false THEN
    RETURN NULL;
  ELSIF p_email_type = 'invitation_received' AND user_prefs.instant_invitation_received = false THEN
    RETURN NULL;
  ELSIF p_email_type IN ('application_accepted', 'application_rejected')
    AND user_prefs.instant_application_status = false THEN
    RETURN NULL;
  END IF;

  -- Insert into email queue
  INSERT INTO email_queue (
    user_id,
    recipient_email,
    recipient_name,
    email_type,
    subject,
    template_params,
    related_project_id,
    related_application_id,
    related_notification_id,
    scheduled_for
  ) VALUES (
    p_user_id,
    user_email,
    user_name,
    p_email_type,
    p_subject,
    p_template_params,
    p_related_project_id,
    p_related_application_id,
    p_related_notification_id,
    p_scheduled_for
  )
  RETURNING id INTO email_id;

  RETURN email_id;
END;
$$;

-- Function to update timestamp on email_queue changes
CREATE OR REPLACE FUNCTION update_email_queue_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_email_queue_timestamp
  BEFORE UPDATE ON email_queue
  FOR EACH ROW
  EXECUTE FUNCTION update_email_queue_timestamp();

-- Function to update timestamp on email_preferences changes
CREATE OR REPLACE FUNCTION update_email_preferences_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_email_preferences_timestamp
  BEFORE UPDATE ON email_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_email_preferences_timestamp();

-- ============================================
-- INTEGRATE WITH EXISTING NOTIFICATION TRIGGERS
-- ============================================

-- Modify application received trigger to also queue emails
CREATE OR REPLACE FUNCTION notify_application_received()
RETURNS TRIGGER AS $$
DECLARE
  project_owner_id UUID;
  project_title TEXT;
  talent_name TEXT;
  entrepreneur_name TEXT;
BEGIN
  -- Get project owner and title
  SELECT owner_id, title INTO project_owner_id, project_title
  FROM projects
  WHERE id = NEW.project_id;

  -- Get talent name
  SELECT first_name || ' ' || last_name INTO talent_name
  FROM profiles
  WHERE id = NEW.talent_id;

  -- Check if this is an invitation or a regular application
  IF NEW.invited_by IS NOT NULL THEN
    -- This is an INVITATION from entrepreneur to talent
    -- Notify the TALENT (in-app notification)

    -- Get entrepreneur name
    SELECT first_name || ' ' || last_name INTO entrepreneur_name
    FROM profiles
    WHERE id = NEW.invited_by;

    PERFORM create_notification(
      NEW.talent_id,
      'application_received',
      'Invitation à un projet ! 🎯',
      entrepreneur_name || ' vous invite à rejoindre le projet "' || project_title || '"',
      NEW.project_id,
      NEW.id,
      NEW.invited_by
    );

    -- Queue email for talent
    PERFORM queue_email(
      NEW.talent_id,
      'invitation_received',
      '🎯 Invitation à rejoindre un projet sur NEYOTA',
      jsonb_build_object(
        'talent_name', talent_name,
        'entrepreneur_name', entrepreneur_name,
        'project_title', project_title,
        'project_id', NEW.project_id,
        'application_id', NEW.id
      ),
      NEW.project_id,
      NEW.id,
      NULL
    );

  ELSE
    -- This is a regular APPLICATION from talent to project
    -- Notify the ENTREPRENEUR (in-app notification)

    PERFORM create_notification(
      project_owner_id,
      'application_received',
      'Nouvelle candidature ! 📨',
      talent_name || ' a postulé à votre projet "' || project_title || '"',
      NEW.project_id,
      NEW.id,
      NEW.talent_id
    );

    -- Queue email for entrepreneur
    PERFORM queue_email(
      project_owner_id,
      'application_received',
      '📨 Nouvelle candidature sur votre projet "' || project_title || '"',
      jsonb_build_object(
        'entrepreneur_name', (SELECT first_name FROM profiles WHERE id = project_owner_id),
        'talent_name', talent_name,
        'project_title', project_title,
        'project_id', NEW.project_id,
        'application_id', NEW.id
      ),
      NEW.project_id,
      NEW.id,
      NULL
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================

COMMENT ON TABLE email_preferences IS
  'User preferences for email notifications. Controls which types of emails users want to receive and at what frequency.';

COMMENT ON TABLE email_queue IS
  'Queue for emails to be sent via Brevo. Edge Functions poll this table and send pending emails.';

COMMENT ON FUNCTION queue_email IS
  'Adds an email to the queue if user preferences allow it. Respects user opt-out settings.';

COMMENT ON FUNCTION create_default_email_preferences IS
  'Automatically creates default email preferences when a new user signs up.';
