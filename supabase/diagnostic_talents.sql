-- Script de diagnostic pour vérifier les talents dans la base de données

-- 1. Vérifier tous les profils existants (avec leurs rôles)
SELECT
  id,
  role,
  first_name,
  last_name,
  city,
  created_at
FROM profiles
ORDER BY created_at DESC;

-- 2. Compter les profils par rôle
SELECT
  role,
  COUNT(*) as count
FROM profiles
GROUP BY role;

-- 3. Vérifier spécifiquement les talents
SELECT
  id,
  first_name,
  last_name,
  city,
  bio,
  availability
FROM profiles
WHERE role = 'talent'
ORDER BY created_at DESC;

-- 4. Vérifier les politiques RLS actives sur la table profiles
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
WHERE tablename = 'profiles';

-- 5. Vérifier si RLS est activé sur profiles
SELECT
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE tablename = 'profiles';
