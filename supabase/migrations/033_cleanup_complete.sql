-- ============================================
-- NETTOYAGE COMPLET pour Migration 033
-- ============================================
-- Ce script supprime TOUT l'ancien et le nouveau système
-- pour repartir sur une base propre

-- ÉTAPE 1: Supprimer toutes les policies
DO $$
DECLARE
  pol record;
BEGIN
  -- Supprimer toutes les policies sur les tables concernées
  FOR pol IN
    SELECT schemaname, tablename, policyname
    FROM pg_policies
    WHERE tablename IN ('user_skills', 'project_needs', 'need_skill_mapping', 'skills', 'needs',
                        'user_skills_old', 'project_skills_needed_old', 'project_skills_needed', 'skills_old')
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', pol.policyname, pol.schemaname, pol.tablename);
  END LOOP;
END $$;

-- ÉTAPE 2: Supprimer toutes les fonctions
DROP FUNCTION IF EXISTS get_needs_for_skill(UUID);
DROP FUNCTION IF EXISTS get_talents_for_need(UUID);

-- ÉTAPE 3: Supprimer toutes les tables (nouvelles et anciennes)
DROP TABLE IF EXISTS user_skills CASCADE;
DROP TABLE IF EXISTS user_skills_old CASCADE;
DROP TABLE IF EXISTS project_needs CASCADE;
DROP TABLE IF EXISTS project_skills_needed CASCADE;
DROP TABLE IF EXISTS project_skills_needed_old CASCADE;
DROP TABLE IF EXISTS need_skill_mapping CASCADE;
DROP TABLE IF EXISTS skills CASCADE;
DROP TABLE IF EXISTS skills_old CASCADE;
DROP TABLE IF EXISTS needs CASCADE;

-- ÉTAPE 4: Supprimer tous les types ENUM (anciens et nouveaux)
DROP TYPE IF EXISTS need_priority CASCADE;
DROP TYPE IF EXISTS skill_type CASCADE;
DROP TYPE IF EXISTS need_category CASCADE;
-- Anciens types
DROP TYPE IF EXISTS skill_category CASCADE;
DROP TYPE IF EXISTS proficiency_level CASCADE;
DROP TYPE IF EXISTS skill_priority CASCADE;

-- Message de confirmation
DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Nettoyage complet terminé !';
  RAISE NOTICE 'Vous pouvez maintenant exécuter la migration 033.';
  RAISE NOTICE '========================================';
END $$;
