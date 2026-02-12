-- Check current RLS policies on profiles
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

-- Drop existing SELECT policies on profiles to avoid conflicts
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Profiles are viewable by authenticated users" ON profiles;
DROP POLICY IF EXISTS "Anyone can view profiles" ON profiles;

-- Create a clear policy that allows everyone to read profiles
CREATE POLICY "Enable read access for all users"
  ON profiles
  FOR SELECT
  USING (true);

-- Verify RLS is enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Test the policy with a sample query
SELECT id, first_name, last_name, role
FROM profiles
LIMIT 5;
