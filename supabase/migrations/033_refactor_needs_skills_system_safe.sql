-- ============================================
-- MIGRATION 033 (VERSION SAFE): Refonte complète du système Besoins/Compétences
-- ============================================
-- Cette migration remplace le système skills par un système dual:
-- - NEEDS (Besoins) pour les porteurs de projets
-- - SKILLS (Compétences) pour les talents
-- - Mapping automatique entre les deux pour le matching
--
-- VERSION SAFE: Peut être réexécutée sans erreur

-- ============================================
-- STEP 1: Créer les nouveaux ENUMs
-- ============================================

-- Catégories de besoins (11 catégories)
DO $$ BEGIN
  CREATE TYPE need_category AS ENUM (
    'structuring',           -- Structurer le projet
    'launching',             -- Lancer le projet
    'finding_clients',       -- Trouver des clients / bénéficiaires
    'branding',              -- Créer une image
    'digital_tools',         -- Développer des outils digitaux
    'finance',               -- Gérer les finances
    'legal',                 -- Cadre légal et administratif
    'organization',          -- Organisation et collaboration
    'growth',                -- Développer le projet
    'impact',                -- Renforcer l'impact du projet
    'mentoring'              -- Accompagnement du projet
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Catégories de compétences (7 types d'intervention)
DO $$ BEGIN
  CREATE TYPE skill_type AS ENUM (
    'strategy',              -- Stratégie / Business / Impact
    'marketing',             -- Marketing / Communication
    'product',               -- Produit / Tech
    'operations',            -- Opérations / Gestion de projet
    'finance_legal_hr',      -- Finance / Juridique / RH
    'commercial',            -- Commercial / Relation client
    'other'                  -- Autre expertise (à préciser)
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Priorité des besoins
DO $$ BEGIN
  CREATE TYPE need_priority AS ENUM (
    'essential',
    'nice_to_have'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- ============================================
-- STEP 2: Créer la table NEEDS
-- ============================================

CREATE TABLE IF NOT EXISTS needs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  category need_category NOT NULL,
  description TEXT,
  sort_order INTEGER DEFAULT 0, -- Pour l'ordre d'affichage dans chaque catégorie

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_needs_category ON needs(category);
CREATE INDEX IF NOT EXISTS idx_needs_sort_order ON needs(category, sort_order);

-- ============================================
-- STEP 3: Recréer la table SKILLS (nouvelle structure)
-- ============================================

-- Renommer l'ancienne table skills (si elle existe et n'a pas déjà été renommée)
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'skills' AND table_schema = 'public')
     AND NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'skills_old' AND table_schema = 'public')
     AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'skills' AND column_name = 'proficiency_level' AND table_schema = 'public')
  THEN
    ALTER TABLE skills RENAME TO skills_old;
  END IF;
END $$;

-- Créer la nouvelle table skills
CREATE TABLE IF NOT EXISTS skills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  category skill_type NOT NULL,
  is_custom BOOLEAN DEFAULT FALSE,
  created_by UUID REFERENCES profiles(id), -- Si custom skill

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_skills_category ON skills(category);

-- ============================================
-- STEP 4: Table de mapping NEEDS ↔ SKILLS
-- ============================================

CREATE TABLE IF NOT EXISTS need_skill_mapping (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  need_id UUID NOT NULL REFERENCES needs(id) ON DELETE CASCADE,
  skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  relevance_score INTEGER DEFAULT 5, -- Score de 1 à 10 pour pondérer le matching

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(need_id, skill_id)
);

-- Index
CREATE INDEX IF NOT EXISTS idx_need_skill_mapping_need ON need_skill_mapping(need_id);
CREATE INDEX IF NOT EXISTS idx_need_skill_mapping_skill ON need_skill_mapping(skill_id);

-- ============================================
-- STEP 5: Recréer PROJECT_NEEDS (remplace project_skills_needed)
-- ============================================

-- Renommer l'ancienne table
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'project_skills_needed' AND table_schema = 'public')
     AND NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'project_skills_needed_old' AND table_schema = 'public')
  THEN
    ALTER TABLE project_skills_needed RENAME TO project_skills_needed_old;
  END IF;
END $$;

-- Créer la nouvelle table project_needs
CREATE TABLE IF NOT EXISTS project_needs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  need_id UUID NOT NULL REFERENCES needs(id) ON DELETE CASCADE,
  priority need_priority NOT NULL DEFAULT 'essential',

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(project_id, need_id)
);

-- Index
CREATE INDEX IF NOT EXISTS idx_project_needs_project ON project_needs(project_id);
CREATE INDEX IF NOT EXISTS idx_project_needs_need ON project_needs(need_id);

-- ============================================
-- STEP 6: Adapter USER_SKILLS
-- ============================================

-- Renommer l'ancienne table
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_skills' AND table_schema = 'public')
     AND NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_skills_old' AND table_schema = 'public')
     AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_skills' AND column_name = 'proficiency_level' AND table_schema = 'public')
  THEN
    ALTER TABLE user_skills RENAME TO user_skills_old;
  END IF;
END $$;

-- Créer la nouvelle table user_skills
CREATE TABLE IF NOT EXISTS user_skills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  custom_detail TEXT, -- Pour "Autre expertise (à préciser)"

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(user_id, skill_id)
);

-- Index
CREATE INDEX IF NOT EXISTS idx_user_skills_user ON user_skills(user_id);
CREATE INDEX IF NOT EXISTS idx_user_skills_skill ON user_skills(skill_id);

-- ============================================
-- STEP 7: Insérer les BESOINS (11 catégories, 44 items)
-- ============================================

-- Supprimer les besoins existants pour éviter les doublons
TRUNCATE TABLE needs CASCADE;

-- Structurer le projet
INSERT INTO needs (category, name, sort_order) VALUES
  ('structuring', 'Clarifier mon idée', 1),
  ('structuring', 'Définir mon modèle économique', 2),
  ('structuring', 'Construire un business plan', 3),
  ('structuring', 'Prioriser mes actions', 4);

-- Lancer le projet
INSERT INTO needs (category, name, sort_order) VALUES
  ('launching', 'Me lancer concrètement', 1),
  ('launching', 'Structurer mon offre', 2),
  ('launching', 'Créer une première version (produit/service)', 3),
  ('launching', 'Tester mon idée', 4);

-- Trouver des clients / bénéficiaires
INSERT INTO needs (category, name, sort_order) VALUES
  ('finding_clients', 'Définir ma cible', 1),
  ('finding_clients', 'Trouver mes premiers clients', 2),
  ('finding_clients', 'Améliorer ma visibilité', 3),
  ('finding_clients', 'Développer ma communication', 4);

-- Créer une image
INSERT INTO needs (category, name, sort_order) VALUES
  ('branding', 'Créer une identité visuelle', 1),
  ('branding', 'Concevoir des supports de communication', 2),
  ('branding', 'Améliorer mon image de marque', 3);

-- Développer des outils digitaux
INSERT INTO needs (category, name, sort_order) VALUES
  ('digital_tools', 'Créer un site web', 1),
  ('digital_tools', 'Développer une application', 2),
  ('digital_tools', 'Mettre en place des outils numériques', 3),
  ('digital_tools', 'Automatiser certaines tâches', 4);

-- Gérer les finances
INSERT INTO needs (category, name, sort_order) VALUES
  ('finance', 'Construire un budget', 1),
  ('finance', 'Trouver des financements', 2),
  ('finance', 'Améliorer la rentabilité', 3),
  ('finance', 'Suivre ma trésorerie', 4);

-- Cadre légal et administratif
INSERT INTO needs (category, name, sort_order) VALUES
  ('legal', 'Choisir un statut juridique', 1),
  ('legal', 'Gérer les aspects administratifs', 2),
  ('legal', 'Protéger mon projet', 3);

-- Organisation et collaboration
INSERT INTO needs (category, name, sort_order) VALUES
  ('organization', 'Structurer mon organisation', 1),
  ('organization', 'Mieux gérer mon temps', 2),
  ('organization', 'Mettre en place une gestion de projet', 3),
  ('organization', 'Travailler en équipe', 4);

-- Développer le projet
INSERT INTO needs (category, name, sort_order) VALUES
  ('growth', 'Faire grandir mon activité', 1),
  ('growth', 'Structurer mon développement', 2),
  ('growth', 'Changer d''échelle', 3);

-- Renforcer l'impact du projet
INSERT INTO needs (category, name, sort_order) VALUES
  ('impact', 'Clarifier mon impact', 1),
  ('impact', 'M''ancrer sur mon territoire', 2),
  ('impact', 'Développer des partenariats', 3);

-- Accompagnement du projet
INSERT INTO needs (category, name, sort_order) VALUES
  ('mentoring', 'Être conseillé / mentoré', 1),
  ('mentoring', 'Prendre du recul', 2),
  ('mentoring', 'Monter en compétences', 3);

-- ============================================
-- STEP 8: Insérer les COMPÉTENCES (7 types)
-- ============================================

-- Supprimer les compétences existantes pour éviter les doublons
TRUNCATE TABLE skills CASCADE;

INSERT INTO skills (category, name, is_custom) VALUES
  ('strategy', 'Stratégie / Business / Impact', FALSE),
  ('marketing', 'Marketing / Communication', FALSE),
  ('product', 'Produit / Tech', FALSE),
  ('operations', 'Opérations / Gestion de projet', FALSE),
  ('finance_legal_hr', 'Finance / Juridique / RH', FALSE),
  ('commercial', 'Commercial / Relation client', FALSE),
  ('other', 'Autre expertise (à préciser)', FALSE);

-- ============================================
-- STEP 9: Créer le MAPPING automatique Besoins ↔ Compétences
-- ============================================

-- Cette table définit quelles compétences répondent à quels besoins
-- Score de pertinence : 10 = très pertinent, 5 = moyennement pertinent, 1 = peu pertinent

-- Variables pour stocker les IDs (on va les récupérer dynamiquement)
DO $$
DECLARE
  -- Skills IDs
  skill_strategy UUID;
  skill_marketing UUID;
  skill_product UUID;
  skill_operations UUID;
  skill_finance UUID;
  skill_commercial UUID;
  skill_other UUID;
BEGIN
  -- Récupérer les IDs des compétences
  SELECT id INTO skill_strategy FROM skills WHERE category = 'strategy';
  SELECT id INTO skill_marketing FROM skills WHERE category = 'marketing';
  SELECT id INTO skill_product FROM skills WHERE category = 'product';
  SELECT id INTO skill_operations FROM skills WHERE category = 'operations';
  SELECT id INTO skill_finance FROM skills WHERE category = 'finance_legal_hr';
  SELECT id INTO skill_commercial FROM skills WHERE category = 'commercial';
  SELECT id INTO skill_other FROM skills WHERE category = 'other';

  -- MAPPING: Structurer le projet → Stratégie (10), Opérations (7)
  INSERT INTO need_skill_mapping (need_id, skill_id, relevance_score)
  SELECT n.id, skill_strategy, 10 FROM needs n WHERE n.category = 'structuring';

  INSERT INTO need_skill_mapping (need_id, skill_id, relevance_score)
  SELECT n.id, skill_operations, 7 FROM needs n WHERE n.category = 'structuring';

  -- MAPPING: Lancer le projet → Stratégie (9), Opérations (9), Produit (7)
  INSERT INTO need_skill_mapping (need_id, skill_id, relevance_score)
  SELECT n.id, skill_strategy, 9 FROM needs n WHERE n.category = 'launching';

  INSERT INTO need_skill_mapping (need_id, skill_id, relevance_score)
  SELECT n.id, skill_operations, 9 FROM needs n WHERE n.category = 'launching';

  INSERT INTO need_skill_mapping (need_id, skill_id, relevance_score)
  SELECT n.id, skill_product, 7 FROM needs n WHERE n.category = 'launching';

  -- MAPPING: Trouver des clients → Marketing (10), Commercial (10), Stratégie (6)
  INSERT INTO need_skill_mapping (need_id, skill_id, relevance_score)
  SELECT n.id, skill_marketing, 10 FROM needs n WHERE n.category = 'finding_clients';

  INSERT INTO need_skill_mapping (need_id, skill_id, relevance_score)
  SELECT n.id, skill_commercial, 10 FROM needs n WHERE n.category = 'finding_clients';

  INSERT INTO need_skill_mapping (need_id, skill_id, relevance_score)
  SELECT n.id, skill_strategy, 6 FROM needs n WHERE n.category = 'finding_clients';

  -- MAPPING: Créer une image → Marketing (10)
  INSERT INTO need_skill_mapping (need_id, skill_id, relevance_score)
  SELECT n.id, skill_marketing, 10 FROM needs n WHERE n.category = 'branding';

  -- MAPPING: Outils digitaux → Produit (10), Opérations (5)
  INSERT INTO need_skill_mapping (need_id, skill_id, relevance_score)
  SELECT n.id, skill_product, 10 FROM needs n WHERE n.category = 'digital_tools';

  INSERT INTO need_skill_mapping (need_id, skill_id, relevance_score)
  SELECT n.id, skill_operations, 5 FROM needs n WHERE n.category = 'digital_tools';

  -- MAPPING: Finances → Finance (10), Stratégie (7)
  INSERT INTO need_skill_mapping (need_id, skill_id, relevance_score)
  SELECT n.id, skill_finance, 10 FROM needs n WHERE n.category = 'finance';

  INSERT INTO need_skill_mapping (need_id, skill_id, relevance_score)
  SELECT n.id, skill_strategy, 7 FROM needs n WHERE n.category = 'finance';

  -- MAPPING: Légal → Finance (10)
  INSERT INTO need_skill_mapping (need_id, skill_id, relevance_score)
  SELECT n.id, skill_finance, 10 FROM needs n WHERE n.category = 'legal';

  -- MAPPING: Organisation → Opérations (10), Stratégie (6)
  INSERT INTO need_skill_mapping (need_id, skill_id, relevance_score)
  SELECT n.id, skill_operations, 10 FROM needs n WHERE n.category = 'organization';

  INSERT INTO need_skill_mapping (need_id, skill_id, relevance_score)
  SELECT n.id, skill_strategy, 6 FROM needs n WHERE n.category = 'organization';

  -- MAPPING: Développer → Stratégie (10), Commercial (8), Marketing (7)
  INSERT INTO need_skill_mapping (need_id, skill_id, relevance_score)
  SELECT n.id, skill_strategy, 10 FROM needs n WHERE n.category = 'growth';

  INSERT INTO need_skill_mapping (need_id, skill_id, relevance_score)
  SELECT n.id, skill_commercial, 8 FROM needs n WHERE n.category = 'growth';

  INSERT INTO need_skill_mapping (need_id, skill_id, relevance_score)
  SELECT n.id, skill_marketing, 7 FROM needs n WHERE n.category = 'growth';

  -- MAPPING: Impact → Stratégie (10), Marketing (6)
  INSERT INTO need_skill_mapping (need_id, skill_id, relevance_score)
  SELECT n.id, skill_strategy, 10 FROM needs n WHERE n.category = 'impact';

  INSERT INTO need_skill_mapping (need_id, skill_id, relevance_score)
  SELECT n.id, skill_marketing, 6 FROM needs n WHERE n.category = 'impact';

  -- MAPPING: Accompagnement → Stratégie (9), Opérations (7)
  INSERT INTO need_skill_mapping (need_id, skill_id, relevance_score)
  SELECT n.id, skill_strategy, 9 FROM needs n WHERE n.category = 'mentoring';

  INSERT INTO need_skill_mapping (need_id, skill_id, relevance_score)
  SELECT n.id, skill_operations, 7 FROM needs n WHERE n.category = 'mentoring';

  -- "Autre expertise" peut répondre à tous les besoins avec un score moyen
  INSERT INTO need_skill_mapping (need_id, skill_id, relevance_score)
  SELECT n.id, skill_other, 5 FROM needs n;

END $$;

-- ============================================
-- STEP 10: RLS (Row Level Security)
-- ============================================

-- Needs: tout le monde peut lire
ALTER TABLE needs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Needs are viewable by everyone" ON needs;
CREATE POLICY "Needs are viewable by everyone"
  ON needs FOR SELECT
  USING (true);

-- Skills: tout le monde peut lire, utilisateurs connectés peuvent créer custom skills
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Skills are viewable by everyone" ON skills;
CREATE POLICY "Skills are viewable by everyone"
  ON skills FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can create custom skills" ON skills;
CREATE POLICY "Authenticated users can create custom skills"
  ON skills FOR INSERT
  WITH CHECK (auth.uid() = created_by AND is_custom = true);

-- Need-Skill Mapping: tout le monde peut lire
ALTER TABLE need_skill_mapping ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Need-skill mapping is viewable by everyone" ON need_skill_mapping;
CREATE POLICY "Need-skill mapping is viewable by everyone"
  ON need_skill_mapping FOR SELECT
  USING (true);

-- Project needs: tout le monde peut lire, propriétaires peuvent gérer
ALTER TABLE project_needs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Everyone can view project needs" ON project_needs;
CREATE POLICY "Everyone can view project needs"
  ON project_needs FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Project owners can manage project needs" ON project_needs;
CREATE POLICY "Project owners can manage project needs"
  ON project_needs FOR ALL
  USING (auth.uid() IN (SELECT owner_id FROM projects WHERE id = project_id));

-- User skills: utilisateurs gèrent leurs propres skills
ALTER TABLE user_skills ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view all user skills" ON user_skills;
CREATE POLICY "Users can view all user skills"
  ON user_skills FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can manage their own skills" ON user_skills;
CREATE POLICY "Users can manage their own skills"
  ON user_skills FOR ALL
  USING (auth.uid() = user_id);

-- ============================================
-- STEP 11: Fonctions utilitaires
-- ============================================

-- Fonction pour obtenir les talents matchant un besoin
CREATE OR REPLACE FUNCTION get_talents_for_need(need_uuid UUID)
RETURNS TABLE (
  user_id UUID,
  skill_name TEXT,
  relevance_score INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    us.user_id,
    s.name as skill_name,
    nsm.relevance_score
  FROM user_skills us
  JOIN skills s ON us.skill_id = s.id
  JOIN need_skill_mapping nsm ON nsm.skill_id = s.id
  WHERE nsm.need_id = need_uuid
  ORDER BY nsm.relevance_score DESC;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour obtenir les besoins matchant une compétence
CREATE OR REPLACE FUNCTION get_needs_for_skill(skill_uuid UUID)
RETURNS TABLE (
  need_id UUID,
  need_name TEXT,
  need_category need_category,
  relevance_score INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    n.id,
    n.name,
    n.category,
    nsm.relevance_score
  FROM needs n
  JOIN need_skill_mapping nsm ON nsm.need_id = n.id
  WHERE nsm.skill_id = skill_uuid
  ORDER BY nsm.relevance_score DESC;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- NOTES DE MIGRATION
-- ============================================

-- Les anciennes tables sont renommées en *_old (skills_old, project_skills_needed_old, user_skills_old)
-- Elles ne sont PAS supprimées pour permettre une récupération si nécessaire
--
-- Pour nettoyer après validation complète :
-- DROP TABLE IF EXISTS skills_old CASCADE;
-- DROP TABLE IF EXISTS project_skills_needed_old CASCADE;
-- DROP TABLE IF EXISTS user_skills_old CASCADE;
-- DROP TYPE IF EXISTS skill_category CASCADE;
-- DROP TYPE IF EXISTS proficiency_level CASCADE;
-- DROP TYPE IF EXISTS skill_priority CASCADE;
