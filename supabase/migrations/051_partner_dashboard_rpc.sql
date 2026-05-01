-- ============================================
-- Migration 051: RPCs dashboard partenaire
-- ============================================
-- 1. get_partner_visible_profiles() : retourne les profils
--    visibles selon le type et le statut du partenaire appelant.
-- 2. register_partner_view() : enregistre une consultation de profil
--    après vérification des droits.
-- ============================================

-- ============================================
-- 1. get_partner_visible_profiles
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
    CASE WHEN p.latitude  IS NOT NULL
         THEN ROUND(p.latitude::NUMERIC,  2)::FLOAT8 END,
    CASE WHEN p.longitude IS NOT NULL
         THEN ROUND(p.longitude::NUMERIC, 2)::FLOAT8 END
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

-- ============================================
-- 2. register_partner_view
-- ============================================

CREATE OR REPLACE FUNCTION register_partner_view(
  p_viewed_profile_id UUID,
  p_viewed_project_id UUID DEFAULT NULL
)
RETURNS VOID
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  v_partner_user_id UUID;
  v_org_type        TEXT;
  v_is_support      BOOLEAN;
  v_can_view        BOOLEAN;
BEGIN
  v_partner_user_id := auth.uid();

  SELECT organization_type::TEXT INTO v_org_type
  FROM partner_organizations
  WHERE user_id = v_partner_user_id AND is_validated = true;

  IF v_org_type IS NULL THEN
    RETURN;
  END IF;

  v_is_support := v_org_type IN (
    'public_collectivity', 'public_support', 'consular_chamber',
    'nonprofit_network', 'incubator_accelerator', 'foundation'
  );

  -- Vérifie que le profil consulté autorise ce type de partenaire
  SELECT EXISTS (
    SELECT 1 FROM partner_visibility_settings pvs
    WHERE pvs.user_id = p_viewed_profile_id
      AND (
        (v_is_support      AND pvs.visible_to_support_partners    = true)
        OR (NOT v_is_support AND pvs.visible_to_commercial_partners = true)
      )
  ) INTO v_can_view;

  IF NOT v_can_view THEN
    RETURN;
  END IF;

  INSERT INTO partner_profile_views (
    partner_user_id,
    viewed_profile_id,
    viewed_project_id,
    viewed_at
  ) VALUES (
    v_partner_user_id,
    p_viewed_profile_id,
    p_viewed_project_id,
    NOW()
  );
EXCEPTION WHEN OTHERS THEN
  NULL; -- Ne pas faire échouer le chargement de la page si la vue ne peut être enregistrée
END;
$$;

GRANT EXECUTE ON FUNCTION register_partner_view(UUID, UUID) TO authenticated;

DO $$ BEGIN
  RAISE NOTICE '✓ Migration 051 : RPCs get_partner_visible_profiles et register_partner_view créés.';
END $$;
