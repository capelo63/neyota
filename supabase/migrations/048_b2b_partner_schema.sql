-- ============================================
-- Migration 048: Module B2B — schéma partenaires
-- ============================================
-- Ajoute :
--   - 'partner' dans l'enum user_role
--   - enum partner_organization_type (9 valeurs)
--   - is_admin BOOLEAN sur profiles (pour les politiques RLS admin)
--   - table partner_organizations
--   - table partner_visibility_settings
--   - table partner_profile_views
--   - RLS + GRANTs
-- ============================================

-- ============================================
-- 1. Enum user_role : nouvelle valeur 'partner'
-- ============================================

ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'partner';

-- ============================================
-- 2. Enum partner_organization_type
-- ============================================

CREATE TYPE partner_organization_type AS ENUM (
  -- Support partners (6 types — accès selon visible_to_support_partners)
  'public_collectivity',      -- Collectivités territoriales
  'public_support',           -- Structures publiques d'accompagnement (BPI, ADEME…)
  'consular_chamber',         -- Chambres consulaires (CCI, CMA…)
  'nonprofit_network',        -- Réseaux d'accompagnement à but non lucratif
  'incubator_accelerator',    -- Incubateurs et accélérateurs
  'foundation',               -- Fondations et acteurs philanthropiques
  -- Commercial partners (3 types — accès selon visible_to_commercial_partners)
  'private_financial',        -- Partenaires financiers privés (banques, VC…)
  'service_provider',         -- Prestataires de services
  'other_commercial'          -- Autres acteurs commerciaux
);

-- ============================================
-- 3. Colonne is_admin sur profiles
-- ============================================

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

-- ============================================
-- 4. Table partner_organizations
-- ============================================

CREATE TABLE partner_organizations (
  id                  UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id             UUID        NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  organization_name   TEXT        NOT NULL,
  organization_type   partner_organization_type NOT NULL,
  organization_subtype TEXT       NOT NULL,
  siret               TEXT        UNIQUE,
  territory_scope     TEXT        CHECK (territory_scope IN ('national', 'regional', 'departmental')),
  territory_codes     TEXT[],
  is_validated        BOOLEAN     DEFAULT false,
  validated_at        TIMESTAMPTZ,
  validated_by        UUID        REFERENCES profiles(id) ON DELETE SET NULL,
  justification_url   TEXT,
  created_at          TIMESTAMPTZ DEFAULT now(),
  updated_at          TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- 5. Table partner_visibility_settings
-- ============================================

CREATE TABLE partner_visibility_settings (
  user_id                       UUID    PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  visible_to_support_partners   BOOLEAN DEFAULT false,
  visible_to_commercial_partners BOOLEAN DEFAULT false,
  updated_at                    TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- 6. Table partner_profile_views
-- ============================================

CREATE TABLE partner_profile_views (
  id                UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  viewed_profile_id UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  viewed_project_id UUID        REFERENCES projects(id) ON DELETE SET NULL,
  partner_user_id   UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  viewed_at         TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- Index
-- ============================================

CREATE INDEX idx_partner_orgs_user_id   ON partner_organizations(user_id);
CREATE INDEX idx_partner_orgs_type      ON partner_organizations(organization_type);
CREATE INDEX idx_partner_orgs_validated ON partner_organizations(is_validated);

-- Index principal pour les compteurs mensuels : viewed_profile_id + date
CREATE INDEX idx_ppv_profile_date   ON partner_profile_views(viewed_profile_id, viewed_at);
CREATE INDEX idx_ppv_partner        ON partner_profile_views(partner_user_id);
-- Index partiel : uniquement les vues liées à un projet (NULL exclus)
CREATE INDEX idx_ppv_project        ON partner_profile_views(viewed_project_id)
  WHERE viewed_project_id IS NOT NULL;

-- ============================================
-- RLS
-- ============================================

ALTER TABLE partner_organizations       ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_visibility_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_profile_views       ENABLE ROW LEVEL SECURITY;

-- --------------------------------------------
-- partner_organizations
-- --------------------------------------------

-- SELECT : le propriétaire voit sa propre fiche ; les admins voient tout
CREATE POLICY "po_select_own_or_admin"
  ON partner_organizations FOR SELECT
  USING (
    auth.uid() = user_id
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- INSERT : uniquement pour son propre compte
CREATE POLICY "po_insert_own"
  ON partner_organizations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- UPDATE : admins uniquement (validation du dossier)
CREATE POLICY "po_update_admin"
  ON partner_organizations FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- --------------------------------------------
-- partner_visibility_settings
-- --------------------------------------------

CREATE POLICY "pvs_select_own"
  ON partner_visibility_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "pvs_insert_own"
  ON partner_visibility_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "pvs_update_own"
  ON partner_visibility_settings FOR UPDATE
  USING (auth.uid() = user_id);

-- --------------------------------------------
-- partner_profile_views
-- --------------------------------------------

-- INSERT : partenaire validé respectant les préférences de visibilité du profil consulté.
-- Support partners (6 types) → visible_to_support_partners = true requis.
-- Commercial partners (3 types) → visible_to_commercial_partners = true requis.
CREATE POLICY "ppv_insert_validated_partner"
  ON partner_profile_views FOR INSERT
  WITH CHECK (
    auth.uid() = partner_user_id
    AND EXISTS (
      SELECT 1
      FROM partner_organizations po
      WHERE po.user_id     = auth.uid()
        AND po.is_validated = true
        AND (
          (
            po.organization_type IN (
              'public_collectivity', 'public_support', 'consular_chamber',
              'nonprofit_network', 'incubator_accelerator', 'foundation'
            )
            AND EXISTS (
              SELECT 1 FROM partner_visibility_settings pvs
              WHERE pvs.user_id = viewed_profile_id
                AND pvs.visible_to_support_partners = true
            )
          )
          OR
          (
            po.organization_type IN (
              'private_financial', 'service_provider', 'other_commercial'
            )
            AND EXISTS (
              SELECT 1 FROM partner_visibility_settings pvs
              WHERE pvs.user_id = viewed_profile_id
                AND pvs.visible_to_commercial_partners = true
            )
          )
        )
    )
  );

-- SELECT : le profil consulté voit ses propres compteurs ;
--          le partenaire voit son propre historique de consultations.
CREATE POLICY "ppv_select_own"
  ON partner_profile_views FOR SELECT
  USING (
    auth.uid() = viewed_profile_id
    OR auth.uid() = partner_user_id
  );

-- ============================================
-- GRANTs
-- ============================================

-- partner_organizations : lecture + création pour authenticated
-- UPDATE limité aux colonnes de validation (RLS restreint aux admins)
GRANT SELECT, INSERT                                              ON partner_organizations       TO authenticated;
GRANT UPDATE (is_validated, validated_at, validated_by)          ON partner_organizations       TO authenticated;

-- partner_visibility_settings : CRUD complet pour authenticated (RLS restreint à soi-même)
GRANT SELECT, INSERT, UPDATE                                      ON partner_visibility_settings TO authenticated;

-- partner_profile_views : lecture + insertion pour authenticated (RLS restreint selon type)
GRANT SELECT, INSERT                                              ON partner_profile_views       TO authenticated;

DO $$ BEGIN
  RAISE NOTICE '✓ Migration 048 : module B2B — enum partner_organization_type (9 valeurs), is_admin sur profiles, tables partner_organizations / partner_visibility_settings / partner_profile_views, RLS et GRANTs.';
END $$;
