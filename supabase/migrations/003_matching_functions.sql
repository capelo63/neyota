-- ============================================
-- MATCHING AND DISTANCE FUNCTIONS
-- ============================================

-- Function to calculate distance between two points (in kilometers)
CREATE OR REPLACE FUNCTION calculate_distance(
  lat1 DECIMAL,
  lon1 DECIMAL,
  lat2 DECIMAL,
  lon2 DECIMAL
)
RETURNS DECIMAL
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN ST_Distance(
    ST_MakePoint(lon1, lat1)::geography,
    ST_MakePoint(lon2, lat2)::geography
  ) / 1000; -- Convert meters to kilometers
END;
$$;

-- Function to update location geography from lat/long
CREATE OR REPLACE FUNCTION update_location_from_coordinates()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.latitude IS NOT NULL AND NEW.longitude IS NOT NULL THEN
    NEW.location = ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326)::geography;
  END IF;
  RETURN NEW;
END;
$$;

-- Trigger for profiles
DROP TRIGGER IF EXISTS update_profile_location ON profiles;
CREATE TRIGGER update_profile_location
  BEFORE INSERT OR UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_location_from_coordinates();

-- Trigger for projects
DROP TRIGGER IF EXISTS update_project_location ON projects;
CREATE TRIGGER update_project_location
  BEFORE INSERT OR UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_location_from_coordinates();

-- Function to find matching projects for a talent
-- Returns projects sorted by relevance (skills match + proximity)
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
  -- Get talent's location and max distance
  SELECT p.location, p.max_distance_km
  INTO talent_location, talent_max_distance
  FROM profiles p
  WHERE p.id = talent_user_id;

  -- Return projects matching the talent's skills and within distance
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
      SELECT COUNT(DISTINCT psn.skill_id)
      FROM project_skills_needed psn
      INNER JOIN user_skills us ON us.skill_id = psn.skill_id
      WHERE psn.project_id = pr.id
        AND us.user_id = talent_user_id
    )::INTEGER AS skills_match_count,
    (
      -- Relevance score: skills match (60%) + proximity bonus (40%)
      (
        SELECT COUNT(DISTINCT psn.skill_id)::DECIMAL
        FROM project_skills_needed psn
        INNER JOIN user_skills us ON us.skill_id = psn.skill_id
        WHERE psn.project_id = pr.id
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
      -- Project is within talent's max distance OR remote is possible
      (
        talent_location IS NOT NULL
        AND pr.location IS NOT NULL
        AND ST_DWithin(talent_location, pr.location, talent_max_distance * 1000)
      )
      OR pr.is_remote_possible = TRUE
    )
    -- Must have at least one matching skill
    AND EXISTS (
      SELECT 1
      FROM project_skills_needed psn
      INNER JOIN user_skills us ON us.skill_id = psn.skill_id
      WHERE psn.project_id = pr.id
        AND us.user_id = talent_user_id
    )
    -- Not already applied
    AND NOT EXISTS (
      SELECT 1
      FROM applications a
      WHERE a.project_id = pr.id
        AND a.applicant_id = talent_user_id
    )
  ORDER BY relevance_score DESC, created_at DESC
  LIMIT max_results;
END;
$$;

-- Function to find matching talents for a project
-- Returns talents sorted by relevance (skills match + proximity)
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
  -- Get project's location and max distance
  SELECT pr.location, pr.preferred_radius_km
  INTO project_location, project_max_distance
  FROM projects pr
  WHERE pr.id = project_uuid;

  -- Return talents matching the project's needed skills and within distance
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
      INNER JOIN project_skills_needed psn ON psn.skill_id = us.skill_id
      WHERE us.user_id = p.id
        AND psn.project_id = project_uuid
    )::INTEGER AS skills_match_count,
    (
      SELECT COUNT(*)
      FROM user_skills us
      WHERE us.user_id = p.id
    )::INTEGER AS total_skills_count,
    (
      -- Relevance score: skills match (70%) + proximity bonus (30%)
      (
        SELECT COUNT(DISTINCT us.skill_id)::DECIMAL
        FROM user_skills us
        INNER JOIN project_skills_needed psn ON psn.skill_id = us.skill_id
        WHERE us.user_id = p.id
          AND psn.project_id = project_uuid
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
      -- Talent is within project's preferred radius OR project allows remote
      (
        project_location IS NOT NULL
        AND p.location IS NOT NULL
        AND ST_DWithin(project_location, p.location, project_max_distance * 1000)
      )
      OR (SELECT is_remote_possible FROM projects WHERE id = project_uuid) = TRUE
    )
    -- Must have at least one matching skill
    AND EXISTS (
      SELECT 1
      FROM user_skills us
      INNER JOIN project_skills_needed psn ON psn.skill_id = us.skill_id
      WHERE us.user_id = p.id
        AND psn.project_id = project_uuid
    )
    -- Not already applied
    AND NOT EXISTS (
      SELECT 1
      FROM applications a
      WHERE a.project_id = project_uuid
        AND a.applicant_id = p.id
    )
  ORDER BY relevance_score DESC
  LIMIT max_results;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION calculate_distance TO authenticated;
GRANT EXECUTE ON FUNCTION find_matching_projects TO authenticated;
GRANT EXECUTE ON FUNCTION find_matching_talents TO authenticated;
