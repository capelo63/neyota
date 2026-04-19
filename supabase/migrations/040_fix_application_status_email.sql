-- ============================================
-- Migration 040: Envoyer l'email au talent lors d'un changement de statut de candidature
-- ============================================
-- Bug : notify_application_status_change (migration 005) crée les notifications in-app
-- mais n'appelle jamais queue_email() pour application_accepted / application_rejected.
-- La migration 019 a corrigé notify_application_received mais pas cette fonction.
-- ============================================

DROP TRIGGER IF EXISTS trigger_application_status_change ON applications;
DROP FUNCTION IF EXISTS notify_application_status_change();

CREATE OR REPLACE FUNCTION notify_application_status_change()
RETURNS TRIGGER AS $$
DECLARE
  project_title TEXT;
  entrepreneur_name TEXT;
  talent_name TEXT;
BEGIN
  IF NEW.status != OLD.status AND (NEW.status = 'accepted' OR NEW.status = 'rejected') THEN

    SELECT title INTO project_title
    FROM projects
    WHERE id = NEW.project_id;

    SELECT p.first_name || ' ' || p.last_name INTO entrepreneur_name
    FROM projects pr
    JOIN profiles p ON pr.owner_id = p.id
    WHERE pr.id = NEW.project_id;

    SELECT first_name || ' ' || last_name INTO talent_name
    FROM profiles
    WHERE id = NEW.talent_id;

    IF NEW.status = 'accepted' THEN
      -- Notification in-app
      PERFORM create_notification(
        NEW.talent_id,
        'application_accepted',
        'Candidature acceptée ! 🎉',
        entrepreneur_name || ' a accepté votre candidature pour "' || project_title || '"',
        NEW.project_id,
        NEW.id,
        (SELECT owner_id FROM projects WHERE id = NEW.project_id)
      );

      -- Email au talent
      PERFORM queue_email(
        NEW.talent_id,
        'application_accepted',
        '🎉 Votre candidature a été acceptée !',
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

    ELSIF NEW.status = 'rejected' THEN
      -- Notification in-app
      PERFORM create_notification(
        NEW.talent_id,
        'application_rejected',
        'Candidature non retenue',
        'Votre candidature pour "' || project_title || '" n''a pas été retenue',
        NEW.project_id,
        NEW.id,
        NULL
      );

      -- Email au talent
      PERFORM queue_email(
        NEW.talent_id,
        'application_rejected',
        'Mise à jour de votre candidature — "' || project_title || '"',
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

DO $$ BEGIN
  RAISE NOTICE '✓ Migration 040 : notify_application_status_change corrigé — queue_email() ajouté pour application_accepted et application_rejected.';
END $$;
