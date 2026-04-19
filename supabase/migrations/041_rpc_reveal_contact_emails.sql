-- ============================================
-- Migration 041: RPC pour révéler les emails de contact après acceptation
-- ============================================
-- Les emails sont dans auth.users, pas dans profiles.
-- Ces fonctions SECURITY DEFINER permettent de les lire sans exposer la table.
-- La sécurité repose sur la vérification du statut 'accepted' en base.
-- ============================================

-- 1. Pour le porteur : retourne {application_id, talent_id, talent_name, talent_email}
--    pour toutes les candidatures acceptées sur son projet.
--    Retourne 0 lignes si l'appelant n'est pas le propriétaire du projet.
DROP FUNCTION IF EXISTS get_accepted_talent_emails(UUID);

CREATE OR REPLACE FUNCTION get_accepted_talent_emails(p_project_id UUID)
RETURNS TABLE (
  application_id UUID,
  talent_id       UUID,
  talent_name     TEXT,
  talent_email    TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Vérifier que l'appelant est bien le porteur du projet
  IF NOT EXISTS (
    SELECT 1 FROM projects
    WHERE id = p_project_id AND owner_id = auth.uid()
  ) THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT
    a.id                                        AS application_id,
    a.talent_id,
    (p.first_name || ' ' || p.last_name)::TEXT  AS talent_name,
    au.email::TEXT                              AS talent_email
  FROM applications a
  JOIN profiles   p  ON p.id  = a.talent_id
  JOIN auth.users au ON au.id = a.talent_id
  WHERE a.project_id = p_project_id
    AND a.status = 'accepted';
END;
$$;

-- 2. Pour le talent : retourne l'email du porteur d'initiative
--    uniquement si le talent a une candidature acceptée pour ce projet.
--    Retourne NULL sinon.
DROP FUNCTION IF EXISTS get_owner_email_if_accepted(UUID);

CREATE OR REPLACE FUNCTION get_owner_email_if_accepted(p_project_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_owner_email TEXT;
BEGIN
  -- Vérifier que l'appelant a bien une candidature acceptée sur ce projet
  IF NOT EXISTS (
    SELECT 1 FROM applications
    WHERE project_id = p_project_id
      AND talent_id  = auth.uid()
      AND status     = 'accepted'
  ) THEN
    RETURN NULL;
  END IF;

  SELECT au.email INTO v_owner_email
  FROM projects    pr
  JOIN auth.users  au ON au.id = pr.owner_id
  WHERE pr.id = p_project_id;

  RETURN v_owner_email;
END;
$$;

GRANT EXECUTE ON FUNCTION get_accepted_talent_emails TO authenticated;
GRANT EXECUTE ON FUNCTION get_owner_email_if_accepted TO authenticated;

DO $$ BEGIN
  RAISE NOTICE '✓ Migration 041 : get_accepted_talent_emails et get_owner_email_if_accepted créées (SECURITY DEFINER, email révélé uniquement si statut accepted).';
END $$;
