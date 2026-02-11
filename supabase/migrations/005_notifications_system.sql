-- ============================================
-- NOTIFICATION SYSTEM
-- ============================================

-- Notification type enum
CREATE TYPE notification_type AS ENUM (
  'application_received',     -- Entrepreneur: nouvelle candidature
  'application_accepted',     -- Talent: candidature acceptée
  'application_rejected',     -- Talent: candidature rejetée
  'new_matching_project',     -- Talent: nouveau projet qui matche
  'message_received'          -- Message reçu (pour future messagerie)
);

-- Notifications table
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type notification_type NOT NULL,

  -- Content
  title TEXT NOT NULL,
  message TEXT NOT NULL,

  -- Related entities (optional)
  related_project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  related_application_id UUID REFERENCES applications(id) ON DELETE CASCADE,
  related_user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,

  -- State
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP WITH TIME ZONE,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Index for performance
  INDEX idx_notifications_user_read (user_id, is_read, created_at DESC)
);

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================
-- TRIGGERS FOR AUTOMATIC NOTIFICATION CREATION
-- ============================================

-- Function to create notification
CREATE OR REPLACE FUNCTION create_notification(
  p_user_id UUID,
  p_type notification_type,
  p_title TEXT,
  p_message TEXT,
  p_related_project_id UUID DEFAULT NULL,
  p_related_application_id UUID DEFAULT NULL,
  p_related_user_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  notification_id UUID;
BEGIN
  INSERT INTO notifications (
    user_id,
    type,
    title,
    message,
    related_project_id,
    related_application_id,
    related_user_id
  ) VALUES (
    p_user_id,
    p_type,
    p_title,
    p_message,
    p_related_project_id,
    p_related_application_id,
    p_related_user_id
  )
  RETURNING id INTO notification_id;

  RETURN notification_id;
END;
$$ LANGUAGE plpgsql;

-- Trigger: New application received
CREATE OR REPLACE FUNCTION notify_application_received()
RETURNS TRIGGER AS $$
DECLARE
  project_owner_id UUID;
  project_title TEXT;
  talent_name TEXT;
BEGIN
  -- Get project owner and title
  SELECT owner_id, title INTO project_owner_id, project_title
  FROM projects
  WHERE id = NEW.project_id;

  -- Get talent name
  SELECT first_name || ' ' || last_name INTO talent_name
  FROM profiles
  WHERE id = NEW.talent_id;

  -- Create notification for project owner
  PERFORM create_notification(
    project_owner_id,
    'application_received',
    'Nouvelle candidature !',
    talent_name || ' a postulé à votre projet "' || project_title || '"',
    NEW.project_id,
    NEW.id,
    NEW.talent_id
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_application_received ON applications;
CREATE TRIGGER trigger_application_received
  AFTER INSERT ON applications
  FOR EACH ROW
  EXECUTE FUNCTION notify_application_received();

-- Trigger: Application status changed
CREATE OR REPLACE FUNCTION notify_application_status_change()
RETURNS TRIGGER AS $$
DECLARE
  project_title TEXT;
  entrepreneur_name TEXT;
BEGIN
  -- Only notify if status changed to accepted or rejected
  IF NEW.status != OLD.status AND (NEW.status = 'accepted' OR NEW.status = 'rejected') THEN

    -- Get project title
    SELECT title INTO project_title
    FROM projects
    WHERE id = NEW.project_id;

    -- Get entrepreneur name
    SELECT p.first_name || ' ' || p.last_name INTO entrepreneur_name
    FROM projects pr
    JOIN profiles p ON pr.owner_id = p.id
    WHERE pr.id = NEW.project_id;

    -- Create notification for talent
    IF NEW.status = 'accepted' THEN
      PERFORM create_notification(
        NEW.talent_id,
        'application_accepted',
        'Candidature acceptée ! 🎉',
        entrepreneur_name || ' a accepté votre candidature pour "' || project_title || '"',
        NEW.project_id,
        NEW.id,
        (SELECT owner_id FROM projects WHERE id = NEW.project_id)
      );
    ELSIF NEW.status = 'rejected' THEN
      PERFORM create_notification(
        NEW.talent_id,
        'application_rejected',
        'Candidature refusée',
        'Votre candidature pour "' || project_title || '" n\'a pas été retenue',
        NEW.project_id,
        NEW.id,
        NULL
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_application_status_change ON applications;
CREATE TRIGGER trigger_application_status_change
  AFTER UPDATE ON applications
  FOR EACH ROW
  EXECUTE FUNCTION notify_application_status_change();

-- Trigger: New project created (notify matching talents)
CREATE OR REPLACE FUNCTION notify_matching_talents_of_new_project()
RETURNS TRIGGER AS $$
DECLARE
  talent_record RECORD;
  talent_count INTEGER := 0;
BEGIN
  -- Find talents that match the project skills and are nearby
  FOR talent_record IN
    SELECT DISTINCT p.id, p.first_name
    FROM profiles p
    JOIN user_skills us ON p.id = us.user_id
    JOIN project_skills_needed psn ON us.skill_id = psn.skill_id
    WHERE psn.project_id = NEW.id
      AND p.role = 'talent'
      AND (
        NEW.location IS NULL
        OR p.location IS NULL
        OR ST_Distance(NEW.location::geography, p.location::geography) / 1000 <= p.max_distance_km
      )
    LIMIT 50  -- Limit to avoid creating too many notifications
  LOOP
    -- Create notification for matching talent
    PERFORM create_notification(
      talent_record.id,
      'new_matching_project',
      'Nouveau projet pour vous ! 🎯',
      'Le projet "' || NEW.title || '" correspond à vos compétences et votre localisation',
      NEW.id,
      NULL,
      NEW.owner_id
    );

    talent_count := talent_count + 1;
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_notify_matching_talents ON projects;
CREATE TRIGGER trigger_notify_matching_talents
  AFTER INSERT ON projects
  FOR EACH ROW
  EXECUTE FUNCTION notify_matching_talents_of_new_project();

-- ============================================
-- UTILITY FUNCTIONS
-- ============================================

-- Function to mark notification as read
CREATE OR REPLACE FUNCTION mark_notification_as_read(notification_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE notifications
  SET is_read = TRUE, read_at = NOW()
  WHERE id = notification_id AND user_id = auth.uid();
END;
$$ LANGUAGE plpgsql;

-- Function to mark all notifications as read for a user
CREATE OR REPLACE FUNCTION mark_all_notifications_as_read()
RETURNS VOID AS $$
BEGIN
  UPDATE notifications
  SET is_read = TRUE, read_at = NOW()
  WHERE user_id = auth.uid() AND is_read = FALSE;
END;
$$ LANGUAGE plpgsql;

-- Function to get unread count
CREATE OR REPLACE FUNCTION get_unread_notifications_count()
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)::INTEGER
    FROM notifications
    WHERE user_id = auth.uid() AND is_read = FALSE
  );
END;
$$ LANGUAGE plpgsql;

-- Function to delete old read notifications (cleanup)
CREATE OR REPLACE FUNCTION delete_old_read_notifications()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  WITH deleted AS (
    DELETE FROM notifications
    WHERE is_read = TRUE
      AND read_at < NOW() - INTERVAL '30 days'
    RETURNING id
  )
  SELECT COUNT(*)::INTEGER INTO deleted_count FROM deleted;

  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;
