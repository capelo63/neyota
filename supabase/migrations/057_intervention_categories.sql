-- ============================================
-- Migration 057 : Domaines d'intervention partenaire
-- ============================================
-- Ajoute la colonne intervention_categories TEXT[]
-- sur la table partner_organizations
-- ============================================

ALTER TABLE partner_organizations
  ADD COLUMN IF NOT EXISTS intervention_categories TEXT[] DEFAULT '{}';

DO $$ BEGIN
  RAISE NOTICE '✓ Migration 057 : colonne intervention_categories ajoutée à partner_organizations.';
END $$;
