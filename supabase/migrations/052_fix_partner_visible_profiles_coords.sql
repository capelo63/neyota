-- ============================================
-- Migration 052: Corriger les coordonnées GPS dans get_partner_visible_profiles
-- ============================================
-- Les colonnes profiles.latitude / profiles.longitude sont NULL pour la
-- majorité des profils car update_profile_location() (migration 007) écrit
-- uniquement dans la colonne PostGIS profiles.location.
-- On remplace la lecture directe de ces colonnes par ST_Y / ST_X sur location.
-- ============================================

CREATE OR REPLACE FUNCTION get_partner_visible_profiles()
RETURNS TABLE (
  id          UUID,
  first_name  TEXT,
  last_name   TEXT,
  role        TEXT,
  bio         TEXT,
  city        TEXT,
  postal_code TEXT,
  region      TEXT,
  avatar_url  TEXT,
  latitude    FLOAT8,
  longitude   FLOAT8
)
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  v_org_type TEXT;
  v_is_support BOOLEAN;
BEGIN
  -- Vérifie que l'appelant est un partenaire validé
  SELECT organization_type::TEXT INTO v_org_type
  FROM partner_organizations
  WHERE user_id = auth.uid()
    AND is_validated = true
    AND (is_rejected IS NOT TRUE);

  IF v_org_type IS NULL THEN
    RETURN;
  END IF;

  v_is_support := v_org_type IN (
    'public_collectivity', 'public_support', 'consular_chamber',
    'nonprofit_network', 'incubator_accelerator', 'foundation'
  );

  RETURN QUERY
  SELECT
    p.id,
    p.first_name,
    p.last_name,
    p.role::TEXT,
    p.bio,
    p.city,
    p.postal_code,
    p.region,
    p.avatar_url,
    CASE WHEN p.location IS NOT NULL
         THEN ROUND(ST_Y(p.location::geometry)::NUMERIC, 2)::FLOAT8 END,
    CASE WHEN p.location IS NOT NULL
         THEN ROUND(ST_X(p.location::geometry)::NUMERIC, 2)::FLOAT8 END
  FROM profiles p
  JOIN partner_visibility_settings pvs ON pvs.user_id = p.id
  WHERE
    p.role IN ('entrepreneur', 'talent')
    AND (
      (v_is_support      AND pvs.visible_to_support_partners    = true)
      OR (NOT v_is_support AND pvs.visible_to_commercial_partners = true)
    )
  ORDER BY p.first_name, p.last_name;
END;
$$;

GRANT EXECUTE ON FUNCTION get_partner_visible_profiles() TO authenticated;

DO $$ BEGIN
  RAISE NOTICE '✓ Migration 052 : get_partner_visible_profiles corrigée pour lire les coordonnées depuis profiles.location (ST_Y / ST_X).';
END $$;
