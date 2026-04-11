-- ============================================
-- SCRIPT DE NETTOYAGE pour Migration 033 (VERSION SAFE)
-- ============================================
-- À exécuter AVANT la migration safe si vous avez des erreurs
-- Ce script supprime tous les objets créés par la migration 033
-- VERSION SAFE: Vérifie l'existence des objets avant de les supprimer

-- Désactiver RLS et supprimer les policies (seulement si les tables existent)
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_skills' AND table_schema = 'public') THEN
    DROP POLICY IF EXISTS "Users can manage their own skills" ON user_skills;
    DROP POLICY IF EXISTS "Users can view all user skills" ON user_skills;
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'project_needs' AND table_schema = 'public') THEN
    DROP POLICY IF EXISTS "Project owners can manage project needs" ON project_needs;
    DROP POLICY IF EXISTS "Everyone can view project needs" ON project_needs;
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'need_skill_mapping' AND table_schema = 'public') THEN
    DROP POLICY IF EXISTS "Need-skill mapping is viewable by everyone" ON need_skill_mapping;
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'skills' AND table_schema = 'public') THEN
    DROP POLICY IF EXISTS "Authenticated users can create custom skills" ON skills;
    DROP POLICY IF EXISTS "Skills are viewable by everyone" ON skills;
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'needs' AND table_schema = 'public') THEN
    DROP POLICY IF EXISTS "Needs are viewable by everyone" ON needs;
  END IF;
END $$;

-- Supprimer les fonctions
DROP FUNCTION IF EXISTS get_needs_for_skill(UUID);
DROP FUNCTION IF EXISTS get_talents_for_need(UUID);

-- Supprimer les tables (CASCADE pour supprimer aussi les contraintes)
DROP TABLE IF EXISTS user_skills CASCADE;
DROP TABLE IF EXISTS project_needs CASCADE;
DROP TABLE IF EXISTS need_skill_mapping CASCADE;
DROP TABLE IF EXISTS skills CASCADE;
DROP TABLE IF EXISTS needs CASCADE;

-- Restaurer les anciennes tables si elles existent
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'skills_old' AND table_schema = 'public') THEN
    DROP TABLE IF EXISTS skills CASCADE;
    ALTER TABLE skills_old RENAME TO skills;
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_skills_old' AND table_schema = 'public') THEN
    DROP TABLE IF EXISTS user_skills CASCADE;
    ALTER TABLE user_skills_old RENAME TO user_skills;
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'project_skills_needed_old' AND table_schema = 'public') THEN
    DROP TABLE IF EXISTS project_skills_needed CASCADE;
    ALTER TABLE project_skills_needed_old RENAME TO project_skills_needed;
  END IF;
END $$;

-- Supprimer les types ENUM
DROP TYPE IF EXISTS need_priority CASCADE;
DROP TYPE IF EXISTS skill_type CASCADE;
DROP TYPE IF EXISTS need_category CASCADE;

-- Message de confirmation
DO $$
BEGIN
  RAISE NOTICE 'Nettoyage terminé. Vous pouvez maintenant exécuter la migration 033_safe.';
END $$;
