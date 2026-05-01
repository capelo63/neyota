-- ============================================
-- Migration 049: Types email partenaires + colonne is_rejected
-- ============================================
-- 1. Met à jour la contrainte valid_email_type de email_queue
--    pour autoriser les nouveaux types du module B2B partenaires.
-- 2. Ajoute is_rejected + rejection_reason à partner_organizations
--    (alternative à la suppression du compte pour le parcours MVP).
-- ============================================

-- Suppression de l'ancienne contrainte CHECK
ALTER TABLE email_queue DROP CONSTRAINT valid_email_type;

-- Recréation avec les nouveaux types partenaires
ALTER TABLE email_queue ADD CONSTRAINT valid_email_type CHECK (
  email_type IN (
    -- Existants
    'application_received',
    'invitation_received',
    'application_accepted',
    'application_rejected',
    'daily_digest',
    'weekly_digest',
    -- Partenaires B2B
    'partner_application_received',   -- confirmation au partenaire après inscription
    'partner_new_submission_admin',   -- notification admin (nouvelle demande)
    'partner_validated',              -- notification au partenaire (compte validé)
    'partner_rejected'                -- notification au partenaire (demande refusée)
  )
);

-- Colonne de rejet sur partner_organizations (MVP : pas de suppression de compte)
ALTER TABLE partner_organizations
  ADD COLUMN IF NOT EXISTS is_rejected      BOOLEAN   DEFAULT false,
  ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

DO $$ BEGIN
  RAISE NOTICE '✓ Migration 049 : contrainte email_type étendue aux types partenaires, colonnes is_rejected/rejection_reason ajoutées.';
END $$;
