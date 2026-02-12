-- Fix RLS on projects table to allow anonymous users to view active projects
-- This is essential for the landing page to display projects

-- Drop existing policies that might be too restrictive
DROP POLICY IF EXISTS "Active projects are viewable by everyone" ON projects;
DROP POLICY IF EXISTS "Public can view active projects" ON projects;

-- Create new policy that explicitly allows anonymous AND authenticated users
CREATE POLICY "Anyone can view active projects"
  ON projects
  FOR SELECT
  TO public, anon, authenticated
  USING (status = 'active');

-- Verify RLS is enabled
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Test query (should return projects for anonymous users)
-- You can run this to verify:
-- SELECT id, title, status FROM projects WHERE status = 'active';
