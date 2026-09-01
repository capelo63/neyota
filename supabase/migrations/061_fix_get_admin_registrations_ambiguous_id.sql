-- ============================================
-- Migration 061 : fix "column reference id is ambiguous"
-- dans get_admin_registrations()
-- ============================================
-- Le IF NOT EXISTS utilisait WHERE id = ... sans qualifier
-- la table, créant une ambiguïté avec la colonne de retour id.
-- Correction : profiles.id et profiles.is_admin explicites.
-- ============================================

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
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
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

DO $$ BEGIN
  RAISE NOTICE '✓ Migration 061 : get_admin_registrations() corrigée (id non ambigu).';
END $$;
