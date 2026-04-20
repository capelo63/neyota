-- ============================================
-- Migration 045: Fix type mismatch dans find_matching_projects
-- ============================================
-- relevance_score est calculé comme double precision (ST_Distance
-- retourne double precision) mais le RETURNS TABLE déclare DECIMAL.
-- Correction : cast explicite ::numeric sur la colonne relevance_score.
-- ============================================

DROP FUNCTION IF EXISTS find_matching_projects(UUID, INTEGER);

CREATE OR REPLACE FUNCTION find_matching_projects(
  talent_user_id UUID,
  max_results INTEGER DEFAULT 10
)
RETURNS TABLE (
  project_id        UUID,
  project_title     TEXT,
  project_pitch     TEXT,
  project_phase     project_phase,
  project_city      TEXT,
  owner_name        TEXT,
  distance_km       DECIMAL,
  skills_match_count INTEGER,
  relevance_score   DECIMAL,
  created_at        TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
AS $$
DECLARE
  talent_location      geography;
  talent_max_distance  INTEGER;
BEGIN
  SELECT p.location, p.max_distance_km
  INTO talent_location, talent_max_distance
  FROM profiles p
  WHERE p.id = talent_user_id;

  RETURN QUERY
  SELECT
    pr.id                                          AS project_id,
    pr.title                                       AS project_title,
    pr.short_pitch                                 AS project_pitch,
    pr.current_phase                               AS project_phase,
    pr.city                                        AS project_city,
    (owner.first_name || ' ' || owner.last_name)  AS owner_name,
    CASE
      WHEN talent_location IS NOT NULL AND pr.location IS NOT NULL
      THEN ROUND((ST_Distance(talent_location, pr.location) / 1000)::numeric, 2)
      ELSE NULL
    END                                            AS distance_km,
    (
      SELECT COUNT(DISTINCT pn.need_id)
      FROM project_needs pn
      INNER JOIN need_skill_mapping nsm ON nsm.need_id = pn.need_id
      INNER JOIN user_skills us         ON us.skill_id = nsm.skill_id
      WHERE pn.project_id = pr.id
        AND us.user_id    = talent_user_id
    )::INTEGER                                     AS skills_match_count,
    (
      (
        SELECT COUNT(DISTINCT pn.need_id)::numeric
        FROM project_needs pn
        INNER JOIN need_skill_mapping nsm ON nsm.need_id = pn.need_id
        INNER JOIN user_skills us         ON us.skill_id = nsm.skill_id
        WHERE pn.project_id = pr.id
          AND us.user_id    = talent_user_id
      ) * 0.6
      +
      CASE
        WHEN talent_location IS NOT NULL AND pr.location IS NOT NULL
        THEN GREATEST(0, (1 - (ST_Distance(talent_location, pr.location) / 1000 / NULLIF(talent_max_distance, 0)))::numeric) * 0.4
        ELSE 0::numeric
      END
    )::numeric                                     AS relevance_score,
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
      FROM project_needs pn
      INNER JOIN need_skill_mapping nsm ON nsm.need_id = pn.need_id
      INNER JOIN user_skills us         ON us.skill_id = nsm.skill_id
      WHERE pn.project_id = pr.id
        AND us.user_id    = talent_user_id
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
  RAISE NOTICE '✓ Migration 045 : find_matching_projects recrée avec cast ::numeric sur relevance_score et distance.';
END $$;
