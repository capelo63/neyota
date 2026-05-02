-- ============================================
-- Migration 054 : Favoris partenaires + données enrichies
-- ============================================
-- 1. Table partner_favorites avec RLS
-- 2. Fonction get_partner_profile_extras() : retourne les phases de
--    projet, catégories de besoins (porteurs) et catégories de
--    compétences (talents) pour une liste de profils.
-- ============================================

-- ============================================
-- 1. Table partner_favorites
-- ============================================

CREATE TABLE IF NOT EXISTS partner_favorites (
  id                 UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_user_id    UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  favorite_profile_id UUID       NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (partner_user_id, favorite_profile_id)
);

ALTER TABLE partner_favorites ENABLE ROW LEVEL SECURITY;

-- Un partenaire ne voit et ne gère que ses propres favoris
CREATE POLICY "partner_favorites_own" ON partner_favorites
  FOR ALL TO authenticated
  USING  (partner_user_id = auth.uid())
  WITH CHECK (partner_user_id = auth.uid());

GRANT SELECT, INSERT, DELETE ON partner_favorites TO authenticated;

-- ============================================
-- 2. Fonction get_partner_profile_extras
-- ============================================

CREATE OR REPLACE FUNCTION get_partner_profile_extras(p_profile_ids UUID[])
RETURNS TABLE (
  profile_id        UUID,
  project_phases    TEXT[],
  need_categories   TEXT[],
  skill_categories  TEXT[]
)
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id AS profile_id,

    -- Phases des projets actifs du porteur
    COALESCE(
      (SELECT array_agg(DISTINCT pr.current_phase::TEXT ORDER BY pr.current_phase::TEXT)
       FROM projects pr
       WHERE pr.owner_id = p.id
         AND pr.status = 'active'),
      '{}'::TEXT[]
    ) AS project_phases,

    -- Catégories de besoins de ses projets actifs
    COALESCE(
      (SELECT array_agg(DISTINCT n.category::TEXT ORDER BY n.category::TEXT)
       FROM project_needs pn
       JOIN projects pr ON pr.id = pn.project_id
       JOIN needs n     ON n.id  = pn.need_id
       WHERE pr.owner_id = p.id
         AND pr.status = 'active'),
      '{}'::TEXT[]
    ) AS need_categories,

    -- Catégories de compétences du talent
    COALESCE(
      (SELECT array_agg(DISTINCT s.category::TEXT ORDER BY s.category::TEXT)
       FROM user_skills us
       JOIN skills s ON s.id = us.skill_id
       WHERE us.user_id = p.id),
      '{}'::TEXT[]
    ) AS skill_categories

  FROM profiles p
  WHERE p.id = ANY(p_profile_ids);
END;
$$;

GRANT EXECUTE ON FUNCTION get_partner_profile_extras(UUID[]) TO authenticated;

DO $$ BEGIN
  RAISE NOTICE '✓ Migration 054 : table partner_favorites + fonction get_partner_profile_extras créées.';
END $$;
