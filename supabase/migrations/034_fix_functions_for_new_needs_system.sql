-- ============================================
-- Migration 034: Fix SQL Functions for New Needs System
-- ============================================
-- This migration updates all SQL functions that still reference
-- the old project_skills_needed table to use the new system:
-- project_needs + need_skill_mapping
-- ============================================

-- 1. Update notify_matching_talents_of_new_project
-- This function is called when a new project is created
CREATE OR REPLACE FUNCTION notify_matching_talents_of_new_project()
RETURNS TRIGGER AS $$
DECLARE
  talent_record RECORD;
  match_score INTEGER;
  notifications_sent INTEGER := 0;
BEGIN
  -- Only notify for active projects
  IF NEW.status != 'active' THEN
    RETURN NEW;
  END IF;

  -- Find talents that match the project with scoring
  -- NEW LOGIC: user_skills → need_skill_mapping → project_needs
  FOR talent_record IN
    SELECT DISTINCT p.id, p.first_name, p.max_distance_km
    FROM profiles p
    JOIN user_skills us ON p.id = us.user_id
    JOIN need_skill_mapping nsm ON us.skill_id = nsm.skill_id
    JOIN project_needs pn ON nsm.need_id = pn.need_id
    WHERE pn.project_id = NEW.id
      AND p.role = 'talent'
      AND (
        NEW.location IS NULL
        OR p.location IS NULL
        OR ST_Distance(NEW.location::geography, p.location::geography) / 1000 <= p.max_distance_km
      )
    ORDER BY p.id  -- Deterministic ordering
  LOOP
    -- Calculate match score
    match_score := calculate_match_score(talent_record.id, NEW.id);

    -- Only notify if score meets minimum threshold (30 points)
    IF match_score >= 30 THEN
      -- Check anti-spam rules
      IF can_send_recommendation(talent_record.id, 'project_to_talent', NEW.id) THEN
        -- Create notification
        PERFORM create_notification(
          talent_record.id,
          'new_matching_project',
          'Nouveau projet pour vous ! 🎯',
          'Le projet "' || NEW.title || '" correspond à votre profil (score: ' || match_score || ')',
          NEW.id,
          NULL,
          NEW.owner_id
        );

        -- Record in history to prevent spam
        INSERT INTO recommendation_history (user_id, notification_type, related_id)
        VALUES (talent_record.id, 'project_to_talent', NEW.id)
        ON CONFLICT (user_id, notification_type, related_id) DO NOTHING;

        notifications_sent := notifications_sent + 1;

        -- Limit to 50 notifications per project to avoid overload
        IF notifications_sent >= 50 THEN
          EXIT;
        END IF;
      END IF;
    END IF;
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Update notify_matching_projects_of_new_talent_internal
-- This function is called when a new talent is created or updated
CREATE OR REPLACE FUNCTION notify_matching_projects_of_new_talent_internal(talent_profile profiles)
RETURNS VOID AS $$
DECLARE
  project_record RECORD;
  match_score INTEGER;
  notifications_sent INTEGER := 0;
BEGIN
  -- Find active projects that match the talent with scoring
  -- NEW LOGIC: user_skills → need_skill_mapping → project_needs → projects
  FOR project_record IN
    SELECT DISTINCT pr.id, pr.title, pr.owner_id, pr.location
    FROM projects pr
    JOIN project_needs pn ON pr.id = pn.project_id
    JOIN need_skill_mapping nsm ON pn.need_id = nsm.need_id
    JOIN user_skills us ON us.skill_id = nsm.skill_id
    WHERE us.user_id = talent_profile.id
      AND pr.status = 'active'
      AND (
        pr.location IS NULL
        OR talent_profile.location IS NULL
        OR ST_Distance(pr.location::geography, talent_profile.location::geography) / 1000 <= talent_profile.max_distance_km
      )
    ORDER BY pr.created_at DESC
  LOOP
    match_score := calculate_match_score(talent_profile.id, project_record.id);

    IF match_score >= 30 THEN
      IF can_send_recommendation(project_record.owner_id, 'talent_to_project', talent_profile.id) THEN
        PERFORM create_notification(
          project_record.owner_id,
          'new_matching_talent',
          'Nouveau talent pour vous ! 🌟',
          talent_profile.first_name || ' ' || COALESCE(talent_profile.last_name, '') || ' correspond à votre projet "' || project_record.title || '" (score: ' || match_score || ')',
          project_record.id,
          NULL,
          talent_profile.id
        );

        INSERT INTO recommendation_history (user_id, notification_type, related_id)
        VALUES (project_record.owner_id, 'talent_to_project', talent_profile.id)
        ON CONFLICT (user_id, notification_type, related_id) DO NOTHING;

        notifications_sent := notifications_sent + 1;

        IF notifications_sent >= 20 THEN
          EXIT;
        END IF;
      END IF;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- 3. Update find_matching_projects function
-- This function finds projects that match a talent's skills
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
  -- NEW LOGIC: Count distinct needs that match via need_skill_mapping
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
      -- Relevance score: needs match (60%) + proximity bonus (40%)
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
      -- Project is within talent's max distance OR remote is possible
      (
        talent_location IS NOT NULL
        AND pr.location IS NOT NULL
        AND ST_DWithin(talent_location, pr.location, talent_max_distance * 1000)
      )
      OR pr.is_remote_possible = TRUE
    )
    -- Must have at least one matching need (via skill mapping)
    AND EXISTS (
      SELECT 1
      FROM project_needs pn
      INNER JOIN need_skill_mapping nsm ON nsm.need_id = pn.need_id
      INNER JOIN user_skills us ON us.skill_id = nsm.skill_id
      WHERE pn.project_id = pr.id
        AND us.user_id = talent_user_id
    )
    -- Not already applied
    AND NOT EXISTS (
      SELECT 1
      FROM applications a
      WHERE a.project_id = pr.id
        AND a.user_id = talent_user_id
    )
  ORDER BY relevance_score DESC, pr.created_at DESC
  LIMIT max_results;
END;
$$;

-- Add comment to document the changes
COMMENT ON FUNCTION notify_matching_talents_of_new_project IS
'Notifies matching talents when a new project is created. Updated for migration 034 to use project_needs + need_skill_mapping instead of project_skills_needed.';

COMMENT ON FUNCTION notify_matching_projects_of_new_talent_internal IS
'Helper function to notify project owners when a new talent matches. Updated for migration 034 to use the new needs/skills mapping system.';

COMMENT ON FUNCTION find_matching_projects IS
'Finds projects matching a talent''s skills. Updated for migration 034 to use project_needs + need_skill_mapping.';
