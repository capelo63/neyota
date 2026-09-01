-- ============================================
-- Migration 060 : alertes d'inscription admin + RPC registrations
-- ============================================
-- 1. Ajout du type new_registration_alert à la contrainte valid_email_type
-- 2. RPC get_admin_registrations() SECURITY DEFINER
-- 3. Trigger notify_admin_new_registration sur INSERT profiles
-- ============================================

-- 1. Mise à jour de la contrainte email_type
ALTER TABLE email_queue DROP CONSTRAINT valid_email_type;

ALTER TABLE email_queue ADD CONSTRAINT valid_email_type CHECK (
  email_type IN (
    'application_received',
    'invitation_received',
    'application_accepted',
    'application_rejected',
    'daily_digest',
    'weekly_digest',
    'welcome_email',
    'profile_incomplete',
    'partner_application_received',
    'partner_new_submission_admin',
    'partner_validated',
    'partner_rejected',
    'partner_contact_request_received',
    'partner_contact_request_accepted',
    'partner_contact_request_declined',
    'new_registration_alert'
  )
);

-- 2. RPC get_admin_registrations — liste tous les inscrits (admin seulement)
CREATE OR REPLACE FUNCTION get_admin_registrations()
RETURNS TABLE (
  id          UUID,
  first_name  TEXT,
  last_name   TEXT,
  email       TEXT,
  role        TEXT,
  city        TEXT,
  postal_code TEXT,
  created_at  TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true
  ) THEN
    RAISE EXCEPTION 'Accès non autorisé';
  END IF;

  RETURN QUERY
  SELECT
    p.id,
    p.first_name,
    p.last_name,
    au.email::TEXT,
    p.role::TEXT,
    p.city,
    p.postal_code,
    p.created_at
  FROM profiles p
  JOIN auth.users au ON au.id = p.id
  ORDER BY p.created_at DESC;
END;
$$;

GRANT EXECUTE ON FUNCTION get_admin_registrations() TO authenticated;

-- 3. Fonction trigger : alerte email à chaque nouvelle inscription
CREATE OR REPLACE FUNCTION notify_admin_new_registration()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_email      TEXT;
  v_role_label TEXT;
  v_admin_link TEXT;
  v_subject    TEXT;
  v_params     JSONB;
BEGIN
  SELECT email INTO v_email FROM auth.users WHERE id = NEW.id;

  v_role_label := CASE NEW.role::TEXT
    WHEN 'talent'       THEN 'Talent'
    WHEN 'entrepreneur' THEN 'Porteur d''initiative'
    WHEN 'partner'      THEN 'Partenaire'
    ELSE NEW.role::TEXT
  END;

  v_admin_link := CASE NEW.role::TEXT
    WHEN 'partner' THEN 'https://www.teriis.fr/admin/partner-validations'
    ELSE               'https://www.teriis.fr/admin/partner-validations?tab=inscriptions'
  END;

  v_subject := 'Nouvelle inscription sur Teriis — '
    || COALESCE(NEW.first_name, '?') || ' '
    || COALESCE(NEW.last_name,  '?') || ' ('
    || v_role_label || ')';

  v_params := jsonb_build_object(
    'first_name',    COALESCE(NEW.first_name, '?'),
    'last_name',     COALESCE(NEW.last_name,  '?'),
    'email',         COALESCE(v_email, '?'),
    'role_label',    v_role_label,
    'registered_at', to_char(NEW.created_at AT TIME ZONE 'Europe/Paris', 'DD/MM/YYYY à HH24:MI'),
    'admin_link',    v_admin_link
  );

  INSERT INTO email_queue (
    user_id, recipient_email, recipient_name,
    email_type, subject, template_params
  )
  VALUES
    (NEW.id, 'cyril.hugon@gmail.com',       'Cyril',   'new_registration_alert', v_subject, v_params),
    (NEW.id, 'cynthia.beausoleil@gmail.com', 'Cynthia', 'new_registration_alert', v_subject, v_params);

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Ne jamais bloquer l'inscription même si l'alerte échoue
  RAISE WARNING 'notify_admin_new_registration: %', SQLERRM;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_notify_admin_new_registration
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION notify_admin_new_registration();

DO $$ BEGIN
  RAISE NOTICE '✓ Migration 060 : new_registration_alert, get_admin_registrations(), trigger créés.';
END $$;
