-- Script de diagnostic : Lister toutes les politiques RLS sur la table projects
-- Exécutez ce script dans Supabase SQL Editor pour voir l'état actuel

-- ============================================
-- 1. Lister toutes les politiques sur projects
-- ============================================

SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'projects'
ORDER BY policyname;

-- ============================================
-- 2. Voir la définition complète de chaque politique
-- ============================================

SELECT
  polname AS policy_name,
  polcmd AS command,
  polroles::regrole[] AS roles,
  pg_get_expr(polqual, polrelid) AS using_expression,
  pg_get_expr(polwithcheck, polrelid) AS with_check_expression
FROM pg_policy
WHERE polrelid = 'projects'::regclass
ORDER BY polname;
