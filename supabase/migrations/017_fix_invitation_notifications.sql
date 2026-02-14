-- Fix notification trigger to handle both applications and invitations correctly
-- When invited_by IS NULL: regular application -> notify entrepreneur
-- When invited_by IS NOT NULL: invitation -> notify talent

DROP TRIGGER IF EXISTS trigger_application_received ON applications;
DROP FUNCTION IF EXISTS notify_application_received();

-- Updated function that handles both applications and invitations
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
    -- Notify the TALENT

    -- Get entrepreneur name
    SELECT first_name || ' ' || last_name INTO entrepreneur_name
    FROM profiles
    WHERE id = NEW.invited_by;

    PERFORM create_notification(
      NEW.talent_id,  -- Notify the talent
      'application_received',  -- Reusing same type for now
      'Invitation à un projet ! 🎯',
      entrepreneur_name || ' vous invite à rejoindre le projet "' || project_title || '"',
      NEW.project_id,
      NEW.id,
      NEW.invited_by  -- The entrepreneur who sent the invitation
    );
  ELSE
    -- This is a regular APPLICATION from talent to project
    -- Notify the ENTREPRENEUR (project owner)

    PERFORM create_notification(
      project_owner_id,  -- Notify the project owner
      'application_received',
      'Nouvelle candidature ! 📨',
      talent_name || ' a postulé à votre projet "' || project_title || '"',
      NEW.project_id,
      NEW.id,
      NEW.talent_id  -- The talent who applied
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate trigger
CREATE TRIGGER trigger_application_received
  AFTER INSERT ON applications
  FOR EACH ROW
  EXECUTE FUNCTION notify_application_received();
