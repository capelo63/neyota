-- ============================================
-- MIGRATION 038: Corriger applicant_id → talent_id dans les triggers
-- ============================================
-- La table applications utilise talent_id, pas applicant_id.
-- Les fonctions de la migration 004 utilisent l'ancien nom de champ.

-- Corriger update_talent_impact_stats
CREATE OR REPLACE FUNCTION update_talent_impact_stats(p_talent_id UUID)
RETURNS VOID AS $$
DECLARE
  accepted_count INTEGER;
  local_projects_count INTEGER;
  total_score INTEGER;
BEGIN
  SELECT COUNT(*) INTO accepted_count
  FROM applications WHERE talent_id = p_talent_id AND status = 'accepted';

  SELECT COUNT(DISTINCT a.project_id) INTO local_projects_count
  FROM applications a
  JOIN projects p ON a.project_id = p.id
  JOIN profiles t ON a.talent_id = t.id
  WHERE a.talent_id = p_talent_id AND a.status = 'accepted'
    AND (p.location IS NULL OR t.location IS NULL OR
         ST_Distance(p.location::geography, t.location::geography) / 1000 <= 50);

  total_score := (accepted_count * 10) + (local_projects_count * 5);

  UPDATE user_impact_stats
  SET projects_helped = accepted_count, impact_score = total_score, updated_at = NOW()
  WHERE user_id = p_talent_id;
END;
$$ LANGUAGE plpgsql;

-- Corriger update_entrepreneur_impact_stats
CREATE OR REPLACE FUNCTION update_entrepreneur_impact_stats(entrepreneur_id UUID)
RETURNS VOID AS $$
DECLARE
  project_count INTEGER;
  talent_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO project_count FROM projects WHERE owner_id = entrepreneur_id;

  SELECT COUNT(DISTINCT a.talent_id)
  INTO talent_count
  FROM applications a
  JOIN projects p ON a.project_id = p.id
  WHERE p.owner_id = entrepreneur_id AND a.status = 'accepted';

  UPDATE user_impact_stats
  SET
    projects_created = project_count,
    talents_recruited = talent_count,
    impact_score = (project_count * 15) + (talent_count * 5),
    updated_at = NOW()
  WHERE user_id = entrepreneur_id;
END;
$$ LANGUAGE plpgsql;

-- Corriger update_stats_on_application_change
CREATE OR REPLACE FUNCTION update_stats_on_application_change()
RETURNS TRIGGER AS $$
DECLARE
  entrepreneur_id UUID;
  talent_role user_role;
BEGIN
  IF NEW.status = 'accepted' AND (OLD.status IS NULL OR OLD.status != 'accepted') THEN
    SELECT owner_id INTO entrepreneur_id FROM projects WHERE id = NEW.project_id;
    SELECT role INTO talent_role FROM profiles WHERE id = NEW.talent_id;

    IF talent_role = 'talent' THEN
      PERFORM update_talent_impact_stats(NEW.talent_id);
      PERFORM award_badges(NEW.talent_id);
    END IF;

    PERFORM update_entrepreneur_impact_stats(entrepreneur_id);
    PERFORM award_badges(entrepreneur_id);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recréer le trigger
DROP TRIGGER IF EXISTS update_stats_on_application ON applications;
CREATE TRIGGER update_stats_on_application
  AFTER INSERT OR UPDATE ON applications
  FOR EACH ROW
  EXECUTE FUNCTION update_stats_on_application_change();

DO $$ BEGIN
  RAISE NOTICE '✓ Migration 038 : applicant_id corrigé en talent_id';
END $$;
