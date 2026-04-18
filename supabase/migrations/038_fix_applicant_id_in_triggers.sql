-- ============================================
-- MIGRATION 038: Corriger applicant_id → talent_id dans les triggers
-- ============================================
-- La table applications utilise talent_id, pas applicant_id.
-- Les fonctions de la migration 004 utilisent l'ancien nom de champ.

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

RAISE NOTICE '✓ Migration 038 : applicant_id corrigé en talent_id';
