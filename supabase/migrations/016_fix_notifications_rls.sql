-- Fix RLS issue with notifications creation
-- The create_notification function is called by triggers but RLS blocks it

-- Make the create_notification function SECURITY DEFINER
-- This allows it to bypass RLS and insert notifications
DROP FUNCTION IF EXISTS create_notification(UUID, notification_type, TEXT, TEXT, UUID, UUID, UUID);

CREATE OR REPLACE FUNCTION create_notification(
  p_user_id UUID,
  p_type notification_type,
  p_title TEXT,
  p_message TEXT,
  p_related_project_id UUID DEFAULT NULL,
  p_related_application_id UUID DEFAULT NULL,
  p_related_user_id UUID DEFAULT NULL
)
RETURNS UUID
SECURITY DEFINER  -- This allows the function to bypass RLS
SET search_path = public
AS $$
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
