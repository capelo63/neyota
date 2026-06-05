-- ============================================
-- Migration 059: Système de demande de contact partenaire
-- ============================================
-- 1. Étendre notification_type avec 'partner_contact_request'
-- 2. Étendre email_queue CHECK avec 3 nouveaux types
-- 3. Créer table partner_contact_requests + RLS
-- 4. RPC create_contact_request (partenaire → profil)
-- 5. RPC respond_to_contact_request (profil → partenaire)
-- 6. RPC get_partner_contact_requests (liste envoyée par le partenaire)
-- 7. RPC get_received_contact_requests (liste reçue par porteur/talent)
-- 8. RPC get_partner_contact_statuses (tableau de bord léger)
-- ============================================

-- 1. Étendre le type ENUM notification_type
ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'partner_contact_request';

-- 2. Mettre à jour la contrainte email_type (DROP + ADD)
ALTER TABLE email_queue DROP CONSTRAINT valid_email_type;

ALTER TABLE email_queue ADD CONSTRAINT valid_email_type CHECK (
  email_type IN (
    -- Types existants
    'application_received',
    'invitation_received',
    'application_accepted',
    'application_rejected',
    'daily_digest',
    'weekly_digest',
    'welcome_email',
    'profile_incomplete',
    -- Types partenaires B2B (migration 049)
    'partner_application_received',
    'partner_new_submission_admin',
    'partner_validated',
    'partner_rejected',
    -- Types demandes de contact (migration 059)
    'partner_contact_request_received',
    'partner_contact_request_accepted',
    'partner_contact_request_declined'
  )
);

-- 3. Table des demandes de contact partenaire
CREATE TABLE partner_contact_requests (
  id                 UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  partner_user_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  target_profile_id  UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  message            TEXT NOT NULL,
  intention          TEXT NOT NULL,
  status             TEXT NOT NULL DEFAULT 'pending'
    CONSTRAINT valid_contact_status CHECK (status IN ('pending', 'accepted', 'declined')),
  decline_reason     TEXT,
  created_at         TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  responded_at       TIMESTAMP WITH TIME ZONE,

  CONSTRAINT unique_partner_target UNIQUE (partner_user_id, target_profile_id)
);

CREATE INDEX idx_partner_contact_requests_partner ON partner_contact_requests(partner_user_id);
CREATE INDEX idx_partner_contact_requests_target  ON partner_contact_requests(target_profile_id);
CREATE INDEX idx_partner_contact_requests_status  ON partner_contact_requests(status);

ALTER TABLE partner_contact_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Partners see their own sent requests"
  ON partner_contact_requests FOR SELECT
  TO authenticated
  USING (partner_user_id = auth.uid());

CREATE POLICY "Targets see requests addressed to them"
  ON partner_contact_requests FOR SELECT
  TO authenticated
  USING (target_profile_id = auth.uid());

GRANT SELECT ON partner_contact_requests TO authenticated;

-- 4. RPC: create_contact_request
CREATE OR REPLACE FUNCTION create_contact_request(
  p_target_profile_id UUID,
  p_message           TEXT,
  p_intention         TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_partner_user_id UUID;
  v_org_name        TEXT;
  v_org_type        TEXT;
  v_partner_fname   TEXT;
  v_partner_lname   TEXT;
  v_target_fname    TEXT;
  v_target_lname    TEXT;
  v_target_email    TEXT;
  v_request_id      UUID;
BEGIN
  v_partner_user_id := auth.uid();
  IF v_partner_user_id IS NULL THEN
    RETURN json_build_object('error', 'Non authentifié');
  END IF;

  -- Vérifier que l'appelant est un partenaire validé
  SELECT po.organization_name, po.organization_type, p.first_name, p.last_name
  INTO v_org_name, v_org_type, v_partner_fname, v_partner_lname
  FROM partner_organizations po
  JOIN profiles p ON p.id = v_partner_user_id
  WHERE po.user_id = v_partner_user_id AND po.is_validated = true;

  IF NOT FOUND THEN
    RETURN json_build_object('error', 'Partenaire non validé');
  END IF;

  -- Valider la longueur du message
  IF length(p_message) < 50 THEN
    RETURN json_build_object('error', 'Le message doit comporter au moins 50 caractères');
  END IF;

  -- Récupérer le profil cible
  SELECT p.first_name, p.last_name, au.email
  INTO v_target_fname, v_target_lname, v_target_email
  FROM profiles p
  JOIN auth.users au ON au.id = p.id
  WHERE p.id = p_target_profile_id;

  IF NOT FOUND THEN
    RETURN json_build_object('error', 'Profil introuvable');
  END IF;

  -- Insérer la demande (UNIQUE constraint gère les doublons)
  BEGIN
    INSERT INTO partner_contact_requests (
      partner_user_id, target_profile_id, message, intention
    ) VALUES (
      v_partner_user_id, p_target_profile_id, p_message, p_intention
    )
    RETURNING id INTO v_request_id;
  EXCEPTION WHEN unique_violation THEN
    RETURN json_build_object('error', 'Une demande existe déjà pour ce profil');
  END;

  -- Notification in-app pour la cible
  PERFORM create_notification(
    p_target_profile_id,
    'partner_contact_request',
    'Demande de contact partenaire',
    v_org_name || ' souhaite entrer en contact avec vous',
    NULL, NULL, v_partner_user_id
  );

  -- Email à la cible
  INSERT INTO email_queue (
    user_id, recipient_email, recipient_name, email_type, subject, template_params
  ) VALUES (
    p_target_profile_id,
    v_target_email,
    v_target_fname || ' ' || v_target_lname,
    'partner_contact_request_received',
    v_org_name || ' souhaite entrer en contact avec vous',
    jsonb_build_object(
      'target_first_name', v_target_fname,
      'partner_org_name',  v_org_name,
      'partner_org_type',  v_org_type,
      'intention',         p_intention,
      'message',           p_message,
      'request_id',        v_request_id
    )
  );

  RETURN json_build_object('success', true, 'request_id', v_request_id);
END;
$$;

-- 5. RPC: respond_to_contact_request
CREATE OR REPLACE FUNCTION respond_to_contact_request(
  p_request_id     UUID,
  p_response       TEXT,
  p_decline_reason TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id           UUID;
  v_request           RECORD;
  v_partner_fname     TEXT;
  v_partner_lname     TEXT;
  v_partner_email     TEXT;
  v_org_name          TEXT;
  v_target_fname      TEXT;
  v_target_lname      TEXT;
  v_target_email      TEXT;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RETURN json_build_object('error', 'Non authentifié');
  END IF;

  IF p_response NOT IN ('accepted', 'declined') THEN
    RETURN json_build_object('error', 'Réponse invalide');
  END IF;

  -- Récupérer et verrouiller la demande
  SELECT * INTO v_request
  FROM partner_contact_requests
  WHERE id = p_request_id
    AND target_profile_id = v_user_id
    AND status = 'pending'
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN json_build_object('error', 'Demande introuvable ou déjà traitée');
  END IF;

  -- Mettre à jour le statut
  UPDATE partner_contact_requests
  SET status = p_response,
      decline_reason = p_decline_reason,
      responded_at = NOW()
  WHERE id = p_request_id;

  -- Infos partenaire
  SELECT p.first_name, p.last_name, au.email, po.organization_name
  INTO v_partner_fname, v_partner_lname, v_partner_email, v_org_name
  FROM profiles p
  JOIN auth.users au ON au.id = p.id
  JOIN partner_organizations po ON po.user_id = p.id
  WHERE p.id = v_request.partner_user_id;

  -- Infos cible
  SELECT p.first_name, p.last_name, au.email
  INTO v_target_fname, v_target_lname, v_target_email
  FROM profiles p
  JOIN auth.users au ON au.id = p.id
  WHERE p.id = v_user_id;

  -- Email au partenaire
  IF p_response = 'accepted' THEN
    INSERT INTO email_queue (
      user_id, recipient_email, recipient_name, email_type, subject, template_params
    ) VALUES (
      v_request.partner_user_id,
      v_partner_email,
      v_partner_fname || ' ' || v_partner_lname,
      'partner_contact_request_accepted',
      v_target_fname || ' ' || v_target_lname || ' a accepté votre demande de contact',
      jsonb_build_object(
        'partner_first_name', v_partner_fname,
        'org_name',           v_org_name,
        'target_first_name',  v_target_fname,
        'target_last_name',   v_target_lname,
        'target_email',       v_target_email
      )
    );
  ELSE
    INSERT INTO email_queue (
      user_id, recipient_email, recipient_name, email_type, subject, template_params
    ) VALUES (
      v_request.partner_user_id,
      v_partner_email,
      v_partner_fname || ' ' || v_partner_lname,
      'partner_contact_request_declined',
      v_target_fname || ' ' || v_target_lname || ' n''a pas souhaité donner suite',
      jsonb_build_object(
        'partner_first_name', v_partner_fname,
        'org_name',           v_org_name,
        'target_first_name',  v_target_fname,
        'decline_reason',     p_decline_reason
      )
    );
  END IF;

  RETURN json_build_object('success', true);
END;
$$;

-- 6. RPC: get_partner_contact_requests (vue partenaire — demandes envoyées)
CREATE OR REPLACE FUNCTION get_partner_contact_requests()
RETURNS TABLE (
  id                UUID,
  target_profile_id UUID,
  target_first_name TEXT,
  target_last_name  TEXT,
  target_role       TEXT,
  target_city       TEXT,
  target_email      TEXT,
  intention         TEXT,
  message           TEXT,
  status            TEXT,
  decline_reason    TEXT,
  created_at        TIMESTAMP WITH TIME ZONE,
  responded_at      TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    r.id,
    r.target_profile_id,
    p.first_name,
    p.last_name,
    p.role::TEXT,
    p.city,
    CASE WHEN r.status = 'accepted' THEN au.email ELSE NULL END,
    r.intention,
    r.message,
    r.status,
    r.decline_reason,
    r.created_at,
    r.responded_at
  FROM partner_contact_requests r
  JOIN profiles p ON p.id = r.target_profile_id
  JOIN auth.users au ON au.id = r.target_profile_id
  WHERE r.partner_user_id = auth.uid()
  ORDER BY r.created_at DESC;
END;
$$;

-- 7. RPC: get_received_contact_requests (vue porteur/talent — demandes reçues)
CREATE OR REPLACE FUNCTION get_received_contact_requests()
RETURNS TABLE (
  id                 UUID,
  partner_user_id    UUID,
  org_name           TEXT,
  org_type           TEXT,
  partner_first_name TEXT,
  partner_last_name  TEXT,
  intention          TEXT,
  message            TEXT,
  status             TEXT,
  created_at         TIMESTAMP WITH TIME ZONE,
  responded_at       TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    r.id,
    r.partner_user_id,
    po.organization_name,
    po.organization_type,
    p.first_name,
    p.last_name,
    r.intention,
    r.message,
    r.status,
    r.created_at,
    r.responded_at
  FROM partner_contact_requests r
  JOIN partner_organizations po ON po.user_id = r.partner_user_id
  JOIN profiles p ON p.id = r.partner_user_id
  WHERE r.target_profile_id = auth.uid()
  ORDER BY r.created_at DESC;
END;
$$;

-- 8. RPC: get_partner_contact_statuses (tableau de bord léger)
CREATE OR REPLACE FUNCTION get_partner_contact_statuses()
RETURNS TABLE (
  target_profile_id UUID,
  status            TEXT,
  contact_email     TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    r.target_profile_id,
    r.status,
    CASE WHEN r.status = 'accepted' THEN au.email ELSE NULL END
  FROM partner_contact_requests r
  JOIN auth.users au ON au.id = r.target_profile_id
  WHERE r.partner_user_id = auth.uid();
END;
$$;

DO $$ BEGIN
  RAISE NOTICE '✓ Migration 059 : système de demande de contact partenaire créé (table, RLS, 5 RPCs).';
END $$;
