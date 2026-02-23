-- Allow anonymous users to view ALL projects (not just active ones)
-- This enables public preview of project pages regardless of status
-- The UI will show appropriate badges for inactive projects

-- Drop existing restrictive policy
DROP POLICY IF EXISTS "Anyone can view active projects" ON projects;

-- Create new policy that allows viewing all projects
CREATE POLICY "Anyone can view all projects"
  ON projects
  FOR SELECT
  TO public, anon, authenticated
  USING (true);

-- Keep other existing policies for INSERT/UPDATE/DELETE
-- (these remain restricted to owners/authenticated users)

-- Verify RLS is still enabled
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
