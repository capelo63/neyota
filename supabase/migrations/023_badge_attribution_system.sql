-- ============================================
-- BADGE ATTRIBUTION SYSTEM
-- ============================================
-- Automatic badge awarding based on user achievements
-- Created: 2026-02-15

-- ============================================
-- FUNCTION: Check and Award Badges
-- ============================================

CREATE OR REPLACE FUNCTION check_and_award_badges(p_user_id UUID)
RETURNS TABLE(badge_awarded badge_type, newly_awarded BOOLEAN)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_stats RECORD;
  v_role TEXT;
  v_badge badge_type;
  v_already_has BOOLEAN;
BEGIN
  -- Get user stats and role
  SELECT
    uis.projects_helped,
    uis.hours_contributed,
    uis.impact_score,
    uis.average_rating,
    uis.total_ratings,
    uis.projects_created,
    uis.talents_recruited,
    p.role
  INTO v_stats
  FROM user_impact_stats uis
  JOIN profiles p ON p.id = uis.user_id
  WHERE uis.user_id = p_user_id;

  -- If no stats found, return empty
  IF NOT FOUND THEN
    RETURN;
  END IF;

  v_role := v_stats.role;

  -- ============================================
  -- BADGE 1: LOCAL AMBASSADOR (Entry level)
  -- ============================================
  -- Criteria: 1 project helped OR 1 project created
  IF (v_stats.projects_helped >= 1 OR v_stats.projects_created >= 1) THEN
    v_badge := 'local_ambassador';

    SELECT EXISTS(
      SELECT 1 FROM user_badges
      WHERE user_id = p_user_id AND badge_type = v_badge
    ) INTO v_already_has;

    IF NOT v_already_has THEN
      INSERT INTO user_badges (user_id, badge_type)
      VALUES (p_user_id, v_badge);

      badge_awarded := v_badge;
      newly_awarded := TRUE;
      RETURN NEXT;
    END IF;
  END IF;

  -- ============================================
  -- BADGE 2: TERRITORY BUILDER (Intermediate)
  -- ============================================
  -- Criteria:
  --   Talents: 3+ projects helped AND 10+ hours contributed
  --   Entrepreneurs: 2+ projects created
  IF (v_role = 'talent' AND v_stats.projects_helped >= 3 AND v_stats.hours_contributed >= 10)
     OR (v_role = 'entrepreneur' AND v_stats.projects_created >= 2) THEN
    v_badge := 'territory_builder';

    SELECT EXISTS(
      SELECT 1 FROM user_badges
      WHERE user_id = p_user_id AND badge_type = v_badge
    ) INTO v_already_has;

    IF NOT v_already_has THEN
      INSERT INTO user_badges (user_id, badge_type)
      VALUES (p_user_id, v_badge);

      badge_awarded := v_badge;
      newly_awarded := TRUE;
      RETURN NEXT;
    END IF;
  END IF;

  -- ============================================
  -- BADGE 3: CITIZEN MENTOR (Rating-based)
  -- ============================================
  -- Criteria: 5+ projects helped, 5+ ratings, average 4.0+
  IF v_role = 'talent'
     AND v_stats.projects_helped >= 5
     AND v_stats.total_ratings >= 5
     AND v_stats.average_rating >= 4.0 THEN
    v_badge := 'citizen_mentor';

    SELECT EXISTS(
      SELECT 1 FROM user_badges
      WHERE user_id = p_user_id AND badge_type = v_badge
    ) INTO v_already_has;

    IF NOT v_already_has THEN
      INSERT INTO user_badges (user_id, badge_type)
      VALUES (p_user_id, v_badge);

      badge_awarded := v_badge;
      newly_awarded := TRUE;
      RETURN NEXT;
    END IF;
  END IF;

  -- ============================================
  -- BADGE 4: TERRITORY PILLAR (Advanced)
  -- ============================================
  -- Criteria:
  --   Talents: 10+ projects helped, 50+ hours, 100+ impact score
  --   Entrepreneurs: 5+ projects created, 100+ impact score
  IF (v_role = 'talent'
      AND v_stats.projects_helped >= 10
      AND v_stats.hours_contributed >= 50
      AND v_stats.impact_score >= 100)
     OR (v_role = 'entrepreneur'
         AND v_stats.projects_created >= 5
         AND v_stats.impact_score >= 100) THEN
    v_badge := 'territory_pillar';

    SELECT EXISTS(
      SELECT 1 FROM user_badges
      WHERE user_id = p_user_id AND badge_type = v_badge
    ) INTO v_already_has;

    IF NOT v_already_has THEN
      INSERT INTO user_badges (user_id, badge_type)
      VALUES (p_user_id, v_badge);

      badge_awarded := v_badge;
      newly_awarded := TRUE;
      RETURN NEXT;
    END IF;
  END IF;

  -- ============================================
  -- BADGE 5: RECOGNIZED EXPERT (Expert level)
  -- ============================================
  -- Criteria:
  --   Talents: 15+ projects, 4.5+ rating, 200+ impact
  --   Entrepreneurs: 8+ projects, 200+ impact
  IF (v_role = 'talent'
      AND v_stats.projects_helped >= 15
      AND v_stats.average_rating >= 4.5
      AND v_stats.impact_score >= 200)
     OR (v_role = 'entrepreneur'
         AND v_stats.projects_created >= 8
         AND v_stats.impact_score >= 200) THEN
    v_badge := 'recognized_expert';

    SELECT EXISTS(
      SELECT 1 FROM user_badges
      WHERE user_id = p_user_id AND badge_type = v_badge
    ) INTO v_already_has;

    IF NOT v_already_has THEN
      INSERT INTO user_badges (user_id, badge_type)
      VALUES (p_user_id, v_badge);

      badge_awarded := v_badge;
      newly_awarded := TRUE;
      RETURN NEXT;
    END IF;
  END IF;

  -- ============================================
  -- BADGE 6: LOCAL LEGEND (Ultimate)
  -- ============================================
  -- Criteria:
  --   Talents: 30+ projects, 100+ hours, 500+ impact, 4.5+ rating
  --   Entrepreneurs: 10+ projects, 500+ impact
  IF (v_role = 'talent'
      AND v_stats.projects_helped >= 30
      AND v_stats.hours_contributed >= 100
      AND v_stats.impact_score >= 500
      AND v_stats.average_rating >= 4.5)
     OR (v_role = 'entrepreneur'
         AND v_stats.projects_created >= 10
         AND v_stats.impact_score >= 500) THEN
    v_badge := 'local_legend';

    SELECT EXISTS(
      SELECT 1 FROM user_badges
      WHERE user_id = p_user_id AND badge_type = v_badge
    ) INTO v_already_has;

    IF NOT v_already_has THEN
      INSERT INTO user_badges (user_id, badge_type)
      VALUES (p_user_id, v_badge);

      badge_awarded := v_badge;
      newly_awarded := TRUE;
      RETURN NEXT;
    END IF;
  END IF;

  RETURN;
END;
$$;

-- ============================================
-- TRIGGER FUNCTION: Update stats and check badges
-- ============================================

CREATE OR REPLACE FUNCTION update_user_stats_and_badges()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_talent_id UUID;
  v_entrepreneur_id UUID;
BEGIN
  -- Determine which user(s) to update based on the table
  IF TG_TABLE_NAME = 'applications' THEN
    v_talent_id := NEW.talent_id;
    v_entrepreneur_id := (SELECT owner_id FROM projects WHERE id = NEW.project_id);

    -- Update talent stats when application is accepted
    IF NEW.status = 'accepted' AND (OLD IS NULL OR OLD.status != 'accepted') THEN
      UPDATE user_impact_stats
      SET projects_helped = projects_helped + 1,
          updated_at = NOW()
      WHERE user_id = v_talent_id;

      -- Update entrepreneur stats
      UPDATE user_impact_stats
      SET talents_recruited = talents_recruited + 1,
          updated_at = NOW()
      WHERE user_id = v_entrepreneur_id;

      -- Check badges for both users
      PERFORM check_and_award_badges(v_talent_id);
      PERFORM check_and_award_badges(v_entrepreneur_id);
    END IF;

  ELSIF TG_TABLE_NAME = 'projects' THEN
    v_user_id := NEW.owner_id;

    -- Update entrepreneur stats when project is created
    IF TG_OP = 'INSERT' THEN
      UPDATE user_impact_stats
      SET projects_created = projects_created + 1,
          updated_at = NOW()
      WHERE user_id = v_user_id;

      -- Check badges
      PERFORM check_and_award_badges(v_user_id);
    END IF;

  ELSIF TG_TABLE_NAME = 'user_impact_stats' THEN
    -- Direct stats update - check badges
    PERFORM check_and_award_badges(NEW.user_id);
  END IF;

  RETURN NEW;
END;
$$;

-- ============================================
-- TRIGGERS
-- ============================================

-- Trigger on applications (when status changes to accepted)
DROP TRIGGER IF EXISTS trigger_update_stats_on_application ON applications;
CREATE TRIGGER trigger_update_stats_on_application
  AFTER INSERT OR UPDATE OF status ON applications
  FOR EACH ROW
  EXECUTE FUNCTION update_user_stats_and_badges();

-- Trigger on projects (when created)
DROP TRIGGER IF EXISTS trigger_update_stats_on_project ON projects;
CREATE TRIGGER trigger_update_stats_on_project
  AFTER INSERT ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_user_stats_and_badges();

-- Trigger on user_impact_stats (when stats are manually updated)
DROP TRIGGER IF EXISTS trigger_check_badges_on_stats_update ON user_impact_stats;
CREATE TRIGGER trigger_check_badges_on_stats_update
  AFTER UPDATE ON user_impact_stats
  FOR EACH ROW
  EXECUTE FUNCTION update_user_stats_and_badges();

-- ============================================
-- RLS POLICIES for user_badges
-- ============================================

-- Everyone can view badges (public achievement)
CREATE POLICY "Badges are viewable by everyone"
  ON user_badges FOR SELECT
  USING (true);

-- Only the system can award badges (via triggers)
-- Users cannot insert/update/delete badges manually

-- ============================================
-- UTILITY FUNCTION: Recalculate all badges
-- ============================================

CREATE OR REPLACE FUNCTION recalculate_all_badges()
RETURNS TABLE(user_id UUID, badges_awarded INTEGER)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user RECORD;
  v_count INTEGER;
BEGIN
  FOR v_user IN
    SELECT DISTINCT uis.user_id
    FROM user_impact_stats uis
  LOOP
    SELECT COUNT(*)
    INTO v_count
    FROM check_and_award_badges(v_user.user_id)
    WHERE newly_awarded = TRUE;

    user_id := v_user.user_id;
    badges_awarded := v_count;
    RETURN NEXT;
  END LOOP;

  RETURN;
END;
$$;

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON FUNCTION check_and_award_badges(UUID) IS
'Checks user achievements and awards appropriate badges. Returns list of badges awarded.';

COMMENT ON FUNCTION update_user_stats_and_badges() IS
'Trigger function that updates user stats and checks for new badges to award.';

COMMENT ON FUNCTION recalculate_all_badges() IS
'Utility function to recalculate badges for all users. Use after changing badge criteria.';
