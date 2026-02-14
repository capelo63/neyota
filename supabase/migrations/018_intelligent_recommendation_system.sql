-- ============================================
-- PHASE 3: SCORING SYSTEM
-- ============================================
-- Create the scoring function first as it will be used by both triggers

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
  -- Get project details
  SELECT location, created_at INTO project_location, project_created_at
  FROM projects
  WHERE id = p_project_id;

  -- Get talent location
  SELECT location INTO talent_location
  FROM profiles
  WHERE id = p_talent_id;

  -- 1. SKILLS MATCHING (20 points per matching skill)
  SELECT COUNT(DISTINCT us.skill_id) INTO matching_skills_count
  FROM user_skills us
  JOIN project_skills_needed psn ON us.skill_id = psn.skill_id
  WHERE us.user_id = p_talent_id
    AND psn.project_id = p_project_id;

  score := score + (matching_skills_count * 20);

  -- 2. GEOGRAPHIC DISTANCE
  IF project_location IS NOT NULL AND talent_location IS NOT NULL THEN
    distance_km := ST_Distance(project_location, talent_location) / 1000;

    IF distance_km < 10 THEN
      score := score + 20;  -- Very close: 20 points
    ELSIF distance_km < 50 THEN
      score := score + 10;  -- Nearby: 10 points
    END IF;
    -- >50km: 0 points
  END IF;

  -- 3. PROJECT RECENCY (<7 days: 10 points)
  IF project_created_at IS NOT NULL THEN
    project_age_days := EXTRACT(DAY FROM (NOW() - project_created_at));

    IF project_age_days < 7 THEN
      score := score + 10;
    END IF;
  END IF;

  -- 4. SAME REGION/DEPARTMENT (first 2 digits of postal code: 5 points)
  SELECT LEFT(postal_code::TEXT, 2) INTO talent_postal_prefix
  FROM profiles
  WHERE id = p_talent_id;

  SELECT LEFT(postal_code::TEXT, 2) INTO project_postal_prefix
  FROM projects
  WHERE id = p_project_id;

  IF talent_postal_prefix IS NOT NULL
     AND project_postal_prefix IS NOT NULL
     AND talent_postal_prefix = project_postal_prefix THEN
    score := score + 5;
  END IF;

  RETURN score;
END;
$$;

-- ============================================
-- ANTI-SPAM SYSTEM
-- ============================================
-- Table to track sent recommendations and prevent spam

CREATE TABLE IF NOT EXISTS recommendation_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL, -- 'project_to_talent' or 'talent_to_project'
  related_id UUID NOT NULL, -- project_id or talent_id
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Prevent duplicate notifications
  UNIQUE(user_id, notification_type, related_id)
);

-- Index for efficient queries
CREATE INDEX idx_recommendation_history_user_sent
  ON recommendation_history(user_id, sent_at DESC);

-- Function to check if we can send a recommendation
CREATE OR REPLACE FUNCTION can_send_recommendation(
  p_user_id UUID,
  p_notification_type TEXT,
  p_related_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
  daily_count INTEGER;
  last_similar_notification TIMESTAMP;
BEGIN
  -- Check if we already sent this exact recommendation in the last 30 days
  SELECT sent_at INTO last_similar_notification
  FROM recommendation_history
  WHERE user_id = p_user_id
    AND notification_type = p_notification_type
    AND related_id = p_related_id
    AND sent_at > NOW() - INTERVAL '30 days'
  LIMIT 1;

  -- If we found a recent similar notification, don't send again
  IF last_similar_notification IS NOT NULL THEN
    RETURN FALSE;
  END IF;

  -- Check daily limit (max 5 recommendations per day)
  SELECT COUNT(*) INTO daily_count
  FROM recommendation_history
  WHERE user_id = p_user_id
    AND sent_at > NOW() - INTERVAL '24 hours';

  IF daily_count >= 5 THEN
    RETURN FALSE;
  END IF;

  RETURN TRUE;
END;
$$;

-- ============================================
-- PHASE 1: ENHANCED PROJECT → TALENTS NOTIFICATION
-- ============================================
-- Drop existing trigger and function
DROP TRIGGER IF EXISTS trigger_notify_matching_talents ON projects;
DROP FUNCTION IF EXISTS notify_matching_talents_of_new_project();

-- Enhanced function with scoring system
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
  FOR talent_record IN
    SELECT DISTINCT p.id, p.first_name, p.max_distance_km
    FROM profiles p
    JOIN user_skills us ON p.id = us.user_id
    JOIN project_skills_needed psn ON us.skill_id = psn.skill_id
    WHERE psn.project_id = NEW.id
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

-- Recreate trigger
CREATE TRIGGER trigger_notify_matching_talents
  AFTER INSERT ON projects
  FOR EACH ROW
  EXECUTE FUNCTION notify_matching_talents_of_new_project();

-- ============================================
-- PHASE 2: NEW TALENT → ENTREPRENEURS NOTIFICATION
-- ============================================
-- Function to notify entrepreneurs when a new talent matches their projects

CREATE OR REPLACE FUNCTION notify_matching_projects_of_new_talent()
RETURNS TRIGGER AS $$
DECLARE
  project_record RECORD;
  match_score INTEGER;
  notifications_sent INTEGER := 0;
BEGIN
  -- Only notify for talent profiles (not entrepreneurs)
  IF NEW.role != 'talent' THEN
    RETURN NEW;
  END IF;

  -- Only notify if profile is complete enough (has at least one skill and location)
  IF NEW.location IS NULL THEN
    RETURN NEW;
  END IF;

  -- Check if talent has at least one skill
  IF NOT EXISTS (SELECT 1 FROM user_skills WHERE user_id = NEW.id) THEN
    RETURN NEW;
  END IF;

  -- Find active projects that match the talent with scoring
  FOR project_record IN
    SELECT DISTINCT pr.id, pr.title, pr.owner_id, pr.location
    FROM projects pr
    JOIN project_skills_needed psn ON pr.id = psn.project_id
    JOIN user_skills us ON us.skill_id = psn.skill_id
    WHERE us.user_id = NEW.id
      AND pr.status = 'active'
      AND (
        pr.location IS NULL
        OR NEW.location IS NULL
        OR ST_Distance(pr.location::geography, NEW.location::geography) / 1000 <= NEW.max_distance_km
      )
    ORDER BY pr.created_at DESC  -- Prioritize recent projects
  LOOP
    -- Calculate match score
    match_score := calculate_match_score(NEW.id, project_record.id);

    -- Only notify if score meets minimum threshold (30 points)
    IF match_score >= 30 THEN
      -- Check anti-spam rules
      IF can_send_recommendation(project_record.owner_id, 'talent_to_project', NEW.id) THEN
        -- Create notification for the project owner (entrepreneur)
        PERFORM create_notification(
          project_record.owner_id,
          'new_matching_talent',
          'Nouveau talent pour vous ! 🌟',
          NEW.first_name || ' ' || COALESCE(NEW.last_name, '') || ' correspond à votre projet "' || project_record.title || '" (score: ' || match_score || ')',
          project_record.id,
          NULL,
          NEW.id
        );

        -- Record in history to prevent spam
        INSERT INTO recommendation_history (user_id, notification_type, related_id)
        VALUES (project_record.owner_id, 'talent_to_project', NEW.id)
        ON CONFLICT (user_id, notification_type, related_id) DO NOTHING;

        notifications_sent := notifications_sent + 1;

        -- Limit to 20 notifications per talent to avoid overload
        IF notifications_sent >= 20 THEN
          EXIT;
        END IF;
      END IF;
    END IF;
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for new talent profiles
CREATE TRIGGER trigger_notify_matching_projects_on_insert
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION notify_matching_projects_of_new_talent();

-- Create trigger for talent profile updates (when skills are added later)
CREATE TRIGGER trigger_notify_matching_projects_on_update
  AFTER UPDATE ON profiles
  FOR EACH ROW
  WHEN (OLD.location IS NULL AND NEW.location IS NOT NULL)  -- Location just added
  EXECUTE FUNCTION notify_matching_projects_of_new_talent();

-- Also trigger when new skills are added to a talent
CREATE OR REPLACE FUNCTION notify_projects_on_skill_added()
RETURNS TRIGGER AS $$
DECLARE
  talent_profile RECORD;
BEGIN
  -- Get the talent profile
  SELECT * INTO talent_profile
  FROM profiles
  WHERE id = NEW.user_id AND role = 'talent';

  -- Only proceed if this is a talent with a complete profile
  IF talent_profile.id IS NOT NULL AND talent_profile.location IS NOT NULL THEN
    -- Reuse the same logic as profile creation
    PERFORM notify_matching_projects_of_new_talent_internal(talent_profile);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Helper function that can be called from different contexts
CREATE OR REPLACE FUNCTION notify_matching_projects_of_new_talent_internal(talent_profile profiles)
RETURNS VOID AS $$
DECLARE
  project_record RECORD;
  match_score INTEGER;
  notifications_sent INTEGER := 0;
BEGIN
  -- Find active projects that match the talent with scoring
  FOR project_record IN
    SELECT DISTINCT pr.id, pr.title, pr.owner_id, pr.location
    FROM projects pr
    JOIN project_skills_needed psn ON pr.id = psn.project_id
    JOIN user_skills us ON us.skill_id = psn.skill_id
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

-- Trigger on user_skills table to detect when new skills are added
CREATE TRIGGER trigger_notify_projects_on_skill_added
  AFTER INSERT ON user_skills
  FOR EACH ROW
  EXECUTE FUNCTION notify_projects_on_skill_added();

-- ============================================
-- RLS POLICIES FOR NEW TABLE
-- ============================================

ALTER TABLE recommendation_history ENABLE ROW LEVEL SECURITY;

-- Users can view their own recommendation history
CREATE POLICY "Users can view their own recommendation history"
  ON recommendation_history
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Only system functions can insert (via SECURITY DEFINER functions)
-- No direct INSERT policy for users

-- ============================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================

COMMENT ON FUNCTION calculate_match_score IS
  'Calculates a match score between a talent and a project based on skills (20pts/skill), distance (<10km: 20pts, <50km: 10pts), project age (<7d: 10pts), and region (5pts). Minimum threshold: 30 points.';

COMMENT ON FUNCTION can_send_recommendation IS
  'Anti-spam check: prevents duplicate notifications (30-day window) and limits to 5 recommendations per user per day.';

COMMENT ON TABLE recommendation_history IS
  'Tracks sent recommendations to prevent spam and duplicate notifications.';

COMMENT ON FUNCTION notify_matching_talents_of_new_project IS
  'Phase 1: Notifies talents when a new project matches their profile (30+ score). Max 50 notifications per project.';

COMMENT ON FUNCTION notify_matching_projects_of_new_talent IS
  'Phase 2: Notifies entrepreneurs when a new talent matches their projects (30+ score). Max 20 notifications per talent.';
