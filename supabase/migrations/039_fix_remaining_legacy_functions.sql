-- ============================================
-- Migration 039: Corriger les fonctions SQL restantes avec références legacy
-- ============================================
-- Fonctions non corrigées par 034/038 :
--   - find_matching_talents        (003) : project_skills_needed + applicant_id
--   - calculate_match_score        (018) : project_skills_needed
--   - notify_matching_projects_of_new_talent (018) : project_skills_needed
-- Bug résiduel dans 034 :
--   - find_matching_projects       (034) : a.user_id → a.talent_id
-- ============================================

-- 1. Corriger find_matching_projects (bug résiduel de 034 : a.user_id → a.talent_id)
CREATE OR REPLACE FUNCTION find_matching_projects(
  talent_user_id UUID,
  max_results INTEGER DEFAULT 10
)
RETURNS TABLE (
  project_id UUID,
  project_title TEXT,
  project_pitch TEXT,
  project_phase project_phase,
  project_city TEXT,
  owner_name TEXT,
  distance_km DECIMAL,
  skills_match_count INTEGER,
  relevance_score DECIMAL,
  created_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
AS $$
DECLARE
  talent_location geography;
  talent_max_distance INTEGER;
BEGIN
  SELECT p.location, p.max_distance_km
  INTO talent_location, talent_max_distance
  FROM profiles p
  WHERE p.id = talent_user_id;

  RETURN QUERY
  SELECT
    pr.id AS project_id,
    pr.title AS project_title,
    pr.short_pitch AS project_pitch,
    pr.current_phase AS project_phase,
    pr.city AS project_city,
    (owner.first_name || ' ' || owner.last_name) AS owner_name,
    CASE
      WHEN talent_location IS NOT NULL AND pr.location IS NOT NULL
      THEN ROUND((ST_Distance(talent_location, pr.location) / 1000)::numeric, 2)
      ELSE NULL
    END AS distance_km,
    (
      SELECT COUNT(DISTINCT pn.need_id)
      FROM project_needs pn
      INNER JOIN need_skill_mapping nsm ON nsm.need_id = pn.need_id
      INNER JOIN user_skills us ON us.skill_id = nsm.skill_id
      WHERE pn.project_id = pr.id
        AND us.user_id = talent_user_id
    )::INTEGER AS skills_match_count,
    (
      (
        SELECT COUNT(DISTINCT pn.need_id)::DECIMAL
        FROM project_needs pn
        INNER JOIN need_skill_mapping nsm ON nsm.need_id = pn.need_id
        INNER JOIN user_skills us ON us.skill_id = nsm.skill_id
        WHERE pn.project_id = pr.id
          AND us.user_id = talent_user_id
      ) * 0.6
      +
      CASE
        WHEN talent_location IS NOT NULL AND pr.location IS NOT NULL
        THEN GREATEST(0, (1 - (ST_Distance(talent_location, pr.location) / 1000 / NULLIF(talent_max_distance, 0)))) * 0.4
        ELSE 0
      END
    ) AS relevance_score,
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
      INNER JOIN user_skills us ON us.skill_id = nsm.skill_id
      WHERE pn.project_id = pr.id
        AND us.user_id = talent_user_id
    )
    AND NOT EXISTS (
      SELECT 1
      FROM applications a
      WHERE a.project_id = pr.id
        AND a.talent_id = talent_user_id
    )
  ORDER BY relevance_score DESC, pr.created_at DESC
  LIMIT max_results;
END;
$$;

-- 2. Corriger find_matching_talents
--    project_skills_needed → project_needs + need_skill_mapping
--    applicant_id          → talent_id
CREATE OR REPLACE FUNCTION find_matching_talents(
  project_uuid UUID,
  max_results INTEGER DEFAULT 20
)
RETURNS TABLE (
  talent_id UUID,
  talent_name TEXT,
  talent_city TEXT,
  talent_bio TEXT,
  distance_km DECIMAL,
  skills_match_count INTEGER,
  total_skills_count INTEGER,
  relevance_score DECIMAL
)
LANGUAGE plpgsql
AS $$
DECLARE
  project_location geography;
  project_max_distance INTEGER;
BEGIN
  SELECT pr.location, pr.preferred_radius_km
  INTO project_location, project_max_distance
  FROM projects pr
  WHERE pr.id = project_uuid;

  RETURN QUERY
  SELECT
    p.id AS talent_id,
    (p.first_name || ' ' || p.last_name) AS talent_name,
    p.city AS talent_city,
    p.bio AS talent_bio,
    CASE
      WHEN project_location IS NOT NULL AND p.location IS NOT NULL
      THEN ROUND((ST_Distance(project_location, p.location) / 1000)::numeric, 2)
      ELSE NULL
    END AS distance_km,
    (
      SELECT COUNT(DISTINCT us.skill_id)
      FROM user_skills us
      INNER JOIN need_skill_mapping nsm ON nsm.skill_id = us.skill_id
      INNER JOIN project_needs pn ON pn.need_id = nsm.need_id
      WHERE us.user_id = p.id
        AND pn.project_id = project_uuid
    )::INTEGER AS skills_match_count,
    (
      SELECT COUNT(*)
      FROM user_skills us
      WHERE us.user_id = p.id
    )::INTEGER AS total_skills_count,
    (
      (
        SELECT COUNT(DISTINCT us.skill_id)::DECIMAL
        FROM user_skills us
        INNER JOIN need_skill_mapping nsm ON nsm.skill_id = us.skill_id
        INNER JOIN project_needs pn ON pn.need_id = nsm.need_id
        WHERE us.user_id = p.id
          AND pn.project_id = project_uuid
      ) * 0.7
      +
      CASE
        WHEN project_location IS NOT NULL AND p.location IS NOT NULL
        THEN GREATEST(0, (1 - (ST_Distance(project_location, p.location) / 1000 / NULLIF(project_max_distance, 0)))) * 0.3
        ELSE 0
      END
    ) AS relevance_score
  FROM profiles p
  WHERE p.role = 'talent'
    AND (
      (
        project_location IS NOT NULL
        AND p.location IS NOT NULL
        AND ST_DWithin(project_location, p.location, project_max_distance * 1000)
      )
      OR (SELECT is_remote_possible FROM projects WHERE id = project_uuid) = TRUE
    )
    AND EXISTS (
      SELECT 1
      FROM user_skills us
      INNER JOIN need_skill_mapping nsm ON nsm.skill_id = us.skill_id
      INNER JOIN project_needs pn ON pn.need_id = nsm.need_id
      WHERE us.user_id = p.id
        AND pn.project_id = project_uuid
    )
    AND NOT EXISTS (
      SELECT 1
      FROM applications a
      WHERE a.project_id = project_uuid
        AND a.talent_id = p.id
    )
  ORDER BY relevance_score DESC
  LIMIT max_results;
END;
$$;

-- 3. Corriger calculate_match_score
--    project_skills_needed → project_needs + need_skill_mapping
CREATE OR REPLACE FUNCTION calculate_match_score(
  p_talent_id UUID,
  p_project_id UUID
)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  score INTEGER := 0;
  matching_skills_count INTEGER;
  distance_km NUMERIC;
  project_age_days INTEGER;
  talent_postal_prefix TEXT;
  project_postal_prefix TEXT;
  project_location GEOGRAPHY;
  talent_location GEOGRAPHY;
  project_created_at TIMESTAMP;
BEGIN
  SELECT location, created_at INTO project_location, project_created_at
  FROM projects
  WHERE id = p_project_id;

  SELECT location INTO talent_location
  FROM profiles
  WHERE id = p_talent_id;

  -- 1. SKILLS MATCHING (20 points par compétence matchée)
  SELECT COUNT(DISTINCT us.skill_id) INTO matching_skills_count
  FROM user_skills us
  INNER JOIN need_skill_mapping nsm ON nsm.skill_id = us.skill_id
  INNER JOIN project_needs pn ON pn.need_id = nsm.need_id
  WHERE us.user_id = p_talent_id
    AND pn.project_id = p_project_id;

  score := score + (matching_skills_count * 20);

  -- 2. DISTANCE GÉOGRAPHIQUE
  IF project_location IS NOT NULL AND talent_location IS NOT NULL THEN
    distance_km := ST_Distance(project_location, talent_location) / 1000;

    IF distance_km < 10 THEN
      score := score + 20;
    ELSIF distance_km < 50 THEN
      score := score + 10;
    END IF;
  END IF;

  -- 3. RÉCENCE DU PROJET (<7 jours : 10 points)
  IF project_created_at IS NOT NULL THEN
    project_age_days := EXTRACT(DAY FROM (NOW() - project_created_at));
    IF project_age_days < 7 THEN
      score := score + 10;
    END IF;
  END IF;

  -- 4. MÊME DÉPARTEMENT (2 premiers chiffres code postal : 5 points)
  SELECT LEFT(postal_code::TEXT, 2) INTO talent_postal_prefix
  FROM profiles WHERE id = p_talent_id;

  SELECT LEFT(postal_code::TEXT, 2) INTO project_postal_prefix
  FROM projects WHERE id = p_project_id;

  IF talent_postal_prefix IS NOT NULL
     AND project_postal_prefix IS NOT NULL
     AND talent_postal_prefix = project_postal_prefix THEN
    score := score + 5;
  END IF;

  RETURN score;
END;
$$;

-- 4. Corriger notify_matching_projects_of_new_talent
--    project_skills_needed → project_needs + need_skill_mapping
CREATE OR REPLACE FUNCTION notify_matching_projects_of_new_talent()
RETURNS TRIGGER AS $$
DECLARE
  project_record RECORD;
  match_score INTEGER;
  notifications_sent INTEGER := 0;
BEGIN
  IF NEW.role != 'talent' THEN
    RETURN NEW;
  END IF;

  IF NEW.location IS NULL THEN
    RETURN NEW;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM user_skills WHERE user_id = NEW.id) THEN
    RETURN NEW;
  END IF;

  FOR project_record IN
    SELECT DISTINCT pr.id, pr.title, pr.owner_id, pr.location
    FROM projects pr
    INNER JOIN project_needs pn ON pr.id = pn.project_id
    INNER JOIN need_skill_mapping nsm ON pn.need_id = nsm.need_id
    INNER JOIN user_skills us ON us.skill_id = nsm.skill_id
    WHERE us.user_id = NEW.id
      AND pr.status = 'active'
      AND (
        pr.location IS NULL
        OR NEW.location IS NULL
        OR ST_Distance(pr.location::geography, NEW.location::geography) / 1000 <= NEW.max_distance_km
      )
    ORDER BY pr.created_at DESC
  LOOP
    match_score := calculate_match_score(NEW.id, project_record.id);

    IF match_score >= 30 THEN
      IF can_send_recommendation(project_record.owner_id, 'talent_to_project', NEW.id) THEN
        PERFORM create_notification(
          project_record.owner_id,
          'new_matching_talent',
          'Nouveau talent pour vous ! 🌟',
          NEW.first_name || ' ' || COALESCE(NEW.last_name, '') || ' correspond à votre projet "' || project_record.title || '" (score: ' || match_score || ')',
          project_record.id,
          NULL,
          NEW.id
        );

        INSERT INTO recommendation_history (user_id, notification_type, related_id)
        VALUES (project_record.owner_id, 'talent_to_project', NEW.id)
        ON CONFLICT (user_id, notification_type, related_id) DO NOTHING;

        notifications_sent := notifications_sent + 1;

        IF notifications_sent >= 20 THEN
          EXIT;
        END IF;
      END IF;
    END IF;
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Grants
GRANT EXECUTE ON FUNCTION find_matching_projects TO authenticated;
GRANT EXECUTE ON FUNCTION find_matching_talents TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_match_score TO authenticated;

DO $$ BEGIN
  RAISE NOTICE '✓ Migration 039 : find_matching_talents, calculate_match_score, notify_matching_projects_of_new_talent corrigés (project_skills_needed → project_needs + need_skill_mapping, applicant_id → talent_id). Bug a.user_id dans find_matching_projects (034) corrigé.';
END $$;
