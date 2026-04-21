-- ============================================
-- Migration 047: Corrections IDOR
-- ============================================
-- 1. REVOKE SELECT sur les tables sources pour anon
--    (profiles_public et projects_public restent accessibles via leurs propres GRANTs)
-- 2. find_matching_projects : vérification que l'appelant est bien le talent demandé
-- ============================================

-- ============================================
-- 1. Révoquer l'accès direct aux tables sources
-- ============================================

REVOKE SELECT ON profiles    FROM anon;
REVOKE SELECT ON user_skills FROM anon;

-- profiles_public et projects_public ont leurs propres GRANTs (migration 042) :
--   GRANT SELECT ON profiles_public    TO anon, authenticated;
--   GRANT SELECT ON projects_public    TO anon, authenticated;
-- Ces vues utilisent les permissions du propriétaire pour accéder aux tables sous-jacentes
-- (comportement PostgreSQL par défaut, security_invoker = false).
-- La RLS continue de s'appliquer au rôle appelant.

-- ============================================
-- 2. find_matching_projects : auth guard
-- ============================================

DROP FUNCTION IF EXISTS find_matching_projects(UUID, INTEGER);

CREATE OR REPLACE FUNCTION find_matching_projects(
  talent_user_id UUID,
  max_results    INTEGER DEFAULT 10
)
RETURNS TABLE (
  project_id         UUID,
  project_title      TEXT,
  project_pitch      TEXT,
  project_phase      project_phase,
  project_city       TEXT,
  owner_name         TEXT,
  distance_km        DECIMAL,
  skills_match_count INTEGER,
  relevance_score    DECIMAL,
  created_at         TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  talent_location     geography;
  talent_max_distance INTEGER;
BEGIN
  -- L'appelant doit être le talent lui-même.
  -- IS DISTINCT FROM gère auth.uid() = NULL (appelant non authentifié) correctement :
  -- NULL != talent_user_id évalue à NULL (≠ TRUE) en SQL, donc != seul ne suffirait pas.
  IF talent_user_id IS DISTINCT FROM auth.uid() THEN
    RETURN;
  END IF;

  SELECT p.location, p.max_distance_km
  INTO talent_location, talent_max_distance
  FROM profiles p
  WHERE p.id = talent_user_id;

  RETURN QUERY
  SELECT
    pr.id                                         AS project_id,
    pr.title                                      AS project_title,
    pr.short_pitch                                AS project_pitch,
    pr.current_phase                              AS project_phase,
    pr.city                                       AS project_city,
    (owner.first_name || ' ' || owner.last_name)  AS owner_name,
    CASE
      WHEN talent_location IS NOT NULL AND pr.location IS NOT NULL
      THEN ROUND((ST_Distance(talent_location, pr.location) / 1000)::numeric, 2)
      ELSE NULL
    END                                           AS distance_km,
    (
      SELECT COUNT(DISTINCT pn_c.need_id)
      FROM project_needs pn_c
      INNER JOIN need_skill_mapping nsm ON nsm.need_id = pn_c.need_id
      INNER JOIN user_skills us         ON us.skill_id = nsm.skill_id
      WHERE pn_c.project_id = pr.id
        AND us.user_id      = talent_user_id
    )::INTEGER                                    AS skills_match_count,
    (
      -- Part compétences : besoins couverts / total besoins × 0.6
      (
        SELECT COUNT(DISTINCT pn_c.need_id)::numeric
        FROM project_needs pn_c
        INNER JOIN need_skill_mapping nsm ON nsm.need_id = pn_c.need_id
        INNER JOIN user_skills us         ON us.skill_id = nsm.skill_id
        WHERE pn_c.project_id = pr.id
          AND us.user_id      = talent_user_id
      )
      / NULLIF(
          (SELECT COUNT(DISTINCT pn_t.need_id)::numeric
           FROM project_needs pn_t
           WHERE pn_t.project_id = pr.id),
          0
        )
      * 0.6
      +
      -- Part distance : score géographique × 0.4
      CASE
        WHEN talent_location IS NOT NULL AND pr.location IS NOT NULL
        THEN GREATEST(0, (1 - (ST_Distance(talent_location, pr.location) / 1000
             / NULLIF(talent_max_distance, 0)))::numeric) * 0.4
        ELSE 0::numeric
      END
    )::numeric                                    AS relevance_score,
    pr.created_at
  FROM projects pr
  INNER JOIN profiles owner ON owner.id = pr.owner_id
  WHERE pr.status = 'active'
    AND (
      (
        talent_location IS NOT NULL
        AND pr.location IS NOT NULL
        AND ST_DWithin(talent_location, pr.location, talent_max_distance * 1000)
      )
      OR pr.is_remote_possible = TRUE
    )
    AND EXISTS (
      SELECT 1
      FROM project_needs pn_e
      INNER JOIN need_skill_mapping nsm ON nsm.need_id = pn_e.need_id
      INNER JOIN user_skills us         ON us.skill_id = nsm.skill_id
      WHERE pn_e.project_id = pr.id
        AND us.user_id      = talent_user_id
    )
    AND NOT EXISTS (
      SELECT 1
      FROM applications a
      WHERE a.project_id = pr.id
        AND a.talent_id  = talent_user_id
    )
  ORDER BY relevance_score DESC, pr.created_at DESC
  LIMIT max_results;
END;
$$;

DO $$ BEGIN
  RAISE NOTICE '✓ Migration 047 : REVOKE SELECT sur profiles et user_skills pour anon ; find_matching_projects protégée par auth.uid() IS NOT DISTINCT FROM talent_user_id.';
END $$;
