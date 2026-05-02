-- ============================================
-- Migration 055 : Ajouter project_categories à get_partner_profile_extras
-- ============================================
-- Remplace la version de la migration 054 pour retourner aussi
-- les catégories thématiques des projets actifs du porteur.
-- ============================================

CREATE OR REPLACE FUNCTION get_partner_profile_extras(p_profile_ids UUID[])
RETURNS TABLE (
  profile_id         UUID,
  project_phases     TEXT[],
  need_categories    TEXT[],
  skill_categories   TEXT[],
  project_categories TEXT[]
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
    ) AS skill_categories,

    -- Catégories thématiques des projets actifs du porteur
    COALESCE(
      (SELECT array_agg(DISTINCT pc.category::TEXT ORDER BY pc.category::TEXT)
       FROM project_categories pc
       JOIN projects pr ON pr.id = pc.project_id
       WHERE pr.owner_id = p.id
         AND pr.status = 'active'),
      '{}'::TEXT[]
    ) AS project_categories

  FROM profiles p
  WHERE p.id = ANY(p_profile_ids);
END;
$$;

GRANT EXECUTE ON FUNCTION get_partner_profile_extras(UUID[]) TO authenticated;

DO $$ BEGIN
  RAISE NOTICE '✓ Migration 055 : get_partner_profile_extras mise à jour avec project_categories.';
END $$;
