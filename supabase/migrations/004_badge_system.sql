-- ============================================
-- BADGE SYSTEM & GAMIFICATION
-- ============================================

-- Function to initialize user impact stats
CREATE OR REPLACE FUNCTION initialize_user_stats()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_impact_stats (id, user_id)
  VALUES (NEW.id, NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to create stats when profile is created
DROP TRIGGER IF EXISTS create_user_stats_on_profile ON profiles;
CREATE TRIGGER create_user_stats_on_profile
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION initialize_user_stats();

-- Function to update impact stats for talents
CREATE OR REPLACE FUNCTION update_talent_impact_stats(talent_id UUID)
RETURNS VOID AS $$
DECLARE
  accepted_count INTEGER;
  local_projects_count INTEGER;
  total_score INTEGER;
BEGIN
  -- Count accepted applications
  SELECT COUNT(*)
  INTO accepted_count
  FROM applications
  WHERE applicant_id = talent_id AND status = 'accepted';

  -- Count local projects (within 50km)
  SELECT COUNT(DISTINCT a.project_id)
  INTO local_projects_count
  FROM applications a
  JOIN projects p ON a.project_id = p.id
  JOIN profiles talent ON a.applicant_id = talent.id
  WHERE a.applicant_id = talent_id
    AND a.status = 'accepted'
    AND (p.location IS NULL OR talent.location IS NULL OR
         ST_Distance(p.location::geography, talent.location::geography) / 1000 <= 50);

  -- Calculate impact score
  -- Formula: (accepted projects * 10) + (local projects * 5)
  total_score := (accepted_count * 10) + (local_projects_count * 5);

  -- Update stats
  UPDATE user_impact_stats
  SET
    projects_helped = accepted_count,
    impact_score = total_score,
    updated_at = NOW()
  WHERE user_id = talent_id;
END;
$$ LANGUAGE plpgsql;

-- Function to update impact stats for entrepreneurs
CREATE OR REPLACE FUNCTION update_entrepreneur_impact_stats(entrepreneur_id UUID)
RETURNS VOID AS $$
DECLARE
  project_count INTEGER;
  talent_count INTEGER;
BEGIN
  -- Count projects created
  SELECT COUNT(*)
  INTO project_count
  FROM projects
  WHERE owner_id = entrepreneur_id;

  -- Count unique talents recruited (accepted applications)
  SELECT COUNT(DISTINCT applicant_id)
  INTO talent_count
  FROM applications a
  JOIN projects p ON a.project_id = p.id
  WHERE p.owner_id = entrepreneur_id AND a.status = 'accepted';

  -- Update stats
  UPDATE user_impact_stats
  SET
    projects_created = project_count,
    talents_recruited = talent_count,
    impact_score = (project_count * 15) + (talent_count * 5),
    updated_at = NOW()
  WHERE user_id = entrepreneur_id;
END;
$$ LANGUAGE plpgsql;

-- Function to check and award badges
CREATE OR REPLACE FUNCTION award_badges(user_id_param UUID)
RETURNS VOID AS $$
DECLARE
  user_role user_role;
  stats RECORD;
  profile_complete BOOLEAN;
BEGIN
  -- Get user role
  SELECT role INTO user_role FROM profiles WHERE id = user_id_param;

  -- Get user stats
  SELECT * INTO stats FROM user_impact_stats WHERE user_id = user_id_param;

  -- Check if profile is complete (has bio and skills for talents)
  SELECT (bio IS NOT NULL AND LENGTH(bio) > 0) INTO profile_complete
  FROM profiles WHERE id = user_id_param;

  -- BADGE 1: Local Ambassador (Ambassadeur Local)
  -- Awarded when profile is complete
  IF profile_complete THEN
    INSERT INTO user_badges (user_id, badge_type)
    VALUES (user_id_param, 'local_ambassador')
    ON CONFLICT (user_id, badge_type) DO NOTHING;
  END IF;

  IF user_role = 'talent' THEN
    -- BADGE 2: Territory Builder (Bâtisseur Territorial)
    -- At least 2 accepted local projects
    IF stats.projects_helped >= 2 THEN
      INSERT INTO user_badges (user_id, badge_type)
      VALUES (user_id_param, 'territory_builder')
      ON CONFLICT (user_id, badge_type) DO NOTHING;
    END IF;

    -- BADGE 3: Territory Pillar (Pilier du Territoire)
    -- At least 5 accepted projects
    IF stats.projects_helped >= 5 THEN
      INSERT INTO user_badges (user_id, badge_type)
      VALUES (user_id_param, 'territory_pillar')
      ON CONFLICT (user_id, badge_type) DO NOTHING;
    END IF;

    -- BADGE 4: Citizen Mentor (Mentor Citoyen)
    -- Impact score > 100 (means active collaboration)
    IF stats.impact_score >= 100 THEN
      INSERT INTO user_badges (user_id, badge_type)
      VALUES (user_id_param, 'citizen_mentor')
      ON CONFLICT (user_id, badge_type) DO NOTHING;
    END IF;

    -- BADGE 5: Recognized Expert (Expert Reconnu)
    -- Average rating > 4.5 with at least 5 ratings
    IF stats.average_rating >= 4.5 AND stats.total_ratings >= 5 THEN
      INSERT INTO user_badges (user_id, badge_type)
      VALUES (user_id_param, 'recognized_expert')
      ON CONFLICT (user_id, badge_type) DO NOTHING;
    END IF;

    -- BADGE 6: Local Legend (Légende Locale)
    -- 10+ projects helped AND impact score > 200
    IF stats.projects_helped >= 10 AND stats.impact_score >= 200 THEN
      INSERT INTO user_badges (user_id, badge_type)
      VALUES (user_id_param, 'local_legend')
      ON CONFLICT (user_id, badge_type) DO NOTHING;
    END IF;

  ELSIF user_role = 'entrepreneur' THEN
    -- BADGE 2: Territory Builder (Bâtisseur Territorial)
    -- At least 1 project created
    IF stats.projects_created >= 1 THEN
      INSERT INTO user_badges (user_id, badge_type)
      VALUES (user_id_param, 'territory_builder')
      ON CONFLICT (user_id, badge_type) DO NOTHING;
    END IF;

    -- BADGE 3: Territory Pillar (Pilier du Territoire)
    -- At least 3 projects created
    IF stats.projects_created >= 3 THEN
      INSERT INTO user_badges (user_id, badge_type)
      VALUES (user_id_param, 'territory_pillar')
      ON CONFLICT (user_id, badge_type) DO NOTHING;
    END IF;

    -- BADGE 4: Citizen Mentor (Mentor Citoyen)
    -- Recruited at least 5 talents
    IF stats.talents_recruited >= 5 THEN
      INSERT INTO user_badges (user_id, badge_type)
      VALUES (user_id_param, 'citizen_mentor')
      ON CONFLICT (user_id, badge_type) DO NOTHING;
    END IF;

    -- BADGE 5: Recognized Expert (Expert Reconnu)
    -- Impact score > 150 (multiple successful projects)
    IF stats.impact_score >= 150 THEN
      INSERT INTO user_badges (user_id, badge_type)
      VALUES (user_id_param, 'recognized_expert')
      ON CONFLICT (user_id, badge_type) DO NOTHING;
    END IF;

    -- BADGE 6: Local Legend (Légende Locale)
    -- 5+ projects AND 10+ talents recruited
    IF stats.projects_created >= 5 AND stats.talents_recruited >= 10 THEN
      INSERT INTO user_badges (user_id, badge_type)
      VALUES (user_id_param, 'local_legend')
      ON CONFLICT (user_id, badge_type) DO NOTHING;
    END IF;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update stats and badges when application status changes
CREATE OR REPLACE FUNCTION update_stats_on_application_change()
RETURNS TRIGGER AS $$
DECLARE
  entrepreneur_id UUID;
  talent_role user_role;
BEGIN
  -- Only process if status changed to 'accepted'
  IF NEW.status = 'accepted' AND (OLD.status IS NULL OR OLD.status != 'accepted') THEN
    -- Get entrepreneur ID from project
    SELECT owner_id INTO entrepreneur_id FROM projects WHERE id = NEW.project_id;

    -- Get talent role to confirm they're a talent
    SELECT role INTO talent_role FROM profiles WHERE id = NEW.applicant_id;

    -- Update talent stats
    IF talent_role = 'talent' THEN
      PERFORM update_talent_impact_stats(NEW.applicant_id);
      PERFORM award_badges(NEW.applicant_id);
    END IF;

    -- Update entrepreneur stats
    PERFORM update_entrepreneur_impact_stats(entrepreneur_id);
    PERFORM award_badges(entrepreneur_id);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_stats_on_application ON applications;
CREATE TRIGGER update_stats_on_application
  AFTER INSERT OR UPDATE ON applications
  FOR EACH ROW
  EXECUTE FUNCTION update_stats_on_application_change();

-- Trigger to update entrepreneur stats when project is created
CREATE OR REPLACE FUNCTION update_stats_on_project_create()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM update_entrepreneur_impact_stats(NEW.owner_id);
  PERFORM award_badges(NEW.owner_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_stats_on_project ON projects;
CREATE TRIGGER update_stats_on_project
  AFTER INSERT ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_stats_on_project_create();

-- Trigger to award Local Ambassador badge when profile bio is added
CREATE OR REPLACE FUNCTION check_profile_completion()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.bio IS NOT NULL AND LENGTH(NEW.bio) > 0 THEN
    PERFORM award_badges(NEW.id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS check_profile_on_update ON profiles;
CREATE TRIGGER check_profile_on_update
  AFTER UPDATE ON profiles
  FOR EACH ROW
  WHEN (OLD.bio IS DISTINCT FROM NEW.bio)
  EXECUTE FUNCTION check_profile_completion();

-- Function to manually recalculate all stats and badges (admin function)
CREATE OR REPLACE FUNCTION recalculate_all_badges()
RETURNS INTEGER AS $$
DECLARE
  user_record RECORD;
  count INTEGER := 0;
BEGIN
  FOR user_record IN SELECT id, role FROM profiles LOOP
    IF user_record.role = 'talent' THEN
      PERFORM update_talent_impact_stats(user_record.id);
    ELSIF user_record.role = 'entrepreneur' THEN
      PERFORM update_entrepreneur_impact_stats(user_record.id);
    END IF;

    PERFORM award_badges(user_record.id);
    count := count + 1;
  END LOOP;

  RETURN count;
END;
$$ LANGUAGE plpgsql;
