-- Fix RLS on user_skills table to allow anonymous users to view talents' skills
-- This is essential for the talents page to display user skills publicly

-- Drop existing restrictive policy
DROP POLICY IF EXISTS "Users can view their own skills" ON user_skills;
DROP POLICY IF EXISTS "Anyone can view user skills" ON user_skills;

-- Create new policy that allows everyone to view user skills
-- This is necessary for public talent profiles
CREATE POLICY "Anyone can view user skills"
  ON user_skills
  FOR SELECT
  TO public, anon, authenticated
  USING (true);

-- Verify RLS is enabled
ALTER TABLE user_skills ENABLE ROW LEVEL SECURITY;

-- Note: Keep existing INSERT/UPDATE/DELETE policies that restrict modifications
-- to the owner only - those are correct for security
