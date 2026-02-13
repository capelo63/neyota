-- Fix RLS on profiles table to explicitly allow anonymous users
-- Similar to the fix we did for projects table
-- The issue: existing policy doesn't explicitly specify anon role

-- Drop existing policy
DROP POLICY IF EXISTS "Enable read access for all users" ON profiles;

-- Recreate with explicit role specification for Supabase
CREATE POLICY "Enable read access for all users"
  ON profiles
  FOR SELECT
  TO public, anon, authenticated
  USING (true);

-- Verify RLS is enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
