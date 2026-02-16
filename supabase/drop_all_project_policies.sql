-- Script de nettoyage : Supprimer TOUTES les politiques RLS sur la table projects
-- Exécutez ce script AVANT la migration 025 si vous rencontrez des problèmes

-- ============================================
-- Lister toutes les politiques existantes
-- ============================================

SELECT
  schemaname,
  tablename,
  policyname,
  cmd AS command
FROM pg_policies
WHERE tablename = 'projects' AND schemaname = 'public'
ORDER BY policyname;

-- ============================================
-- Supprimer dynamiquement TOUTES les politiques
-- ============================================

DO $$
DECLARE
  policy_record RECORD;
  policy_count INTEGER := 0;
BEGIN
  -- Loop through all policies on the projects table
  FOR policy_record IN
    SELECT policyname
    FROM pg_policies
    WHERE tablename = 'projects' AND schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON projects', policy_record.policyname);
    policy_count := policy_count + 1;
    RAISE NOTICE 'Dropped policy: %', policy_record.policyname;
  END LOOP;

  RAISE NOTICE '✅ Total policies dropped: %', policy_count;
END $$;

-- ============================================
-- Vérifier que toutes les politiques ont été supprimées
-- ============================================

SELECT
  CASE
    WHEN COUNT(*) = 0 THEN '✅ All policies dropped successfully'
    ELSE '⚠️ Warning: ' || COUNT(*) || ' policies still exist'
  END AS status
FROM pg_policies
WHERE tablename = 'projects' AND schemaname = 'public';
