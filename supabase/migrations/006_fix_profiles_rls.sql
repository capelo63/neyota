-- Fix RLS policies on profiles table to allow joins from projects
-- This ensures that when querying projects with owner information,
-- the profiles table allows reading the basic user info

-- Drop potentially conflicting policies
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Profiles are viewable by authenticated users" ON profiles;
DROP POLICY IF EXISTS "Anyone can view profiles" ON profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON profiles;

-- Create a comprehensive read policy for profiles
-- This allows ANY user (authenticated or not) to view profile information
-- which is necessary for displaying project owners, talent profiles, etc.
CREATE POLICY "Enable read access for all users"
  ON profiles
  FOR SELECT
  USING (true);

-- Ensure RLS is enabled (should already be, but making sure)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Keep the existing INSERT and UPDATE policies
-- (They should still exist from the initial migration)
