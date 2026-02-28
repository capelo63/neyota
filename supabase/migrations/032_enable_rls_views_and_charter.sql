-- ============================================
-- MIGRATION 032: Enable RLS on project_views_log and user_charter_acceptances
-- ============================================
-- Fix Supabase security warnings for tables missing RLS

-- ============================================
-- 1. PROJECT VIEWS LOG
-- ============================================
-- Tracks who viewed which projects (analytics & traceability)

-- Enable RLS
ALTER TABLE project_views_log ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own viewing history
CREATE POLICY "Users can view their own project views"
  ON project_views_log
  FOR SELECT
  TO authenticated
  USING (viewer_id = auth.uid());

-- Policy: Project owners can see who viewed their projects
CREATE POLICY "Project owners can view their project analytics"
  ON project_views_log
  FOR SELECT
  TO authenticated
  USING (
    project_id IN (
      SELECT id FROM projects WHERE owner_id = auth.uid()
    )
  );

-- Policy: Service role can insert view logs (anonymous + authenticated)
CREATE POLICY "Service role can insert project views"
  ON project_views_log
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Policy: Allow inserting views for authenticated users
CREATE POLICY "Authenticated users can log their own views"
  ON project_views_log
  FOR INSERT
  TO authenticated
  WITH CHECK (viewer_id = auth.uid() OR viewer_id IS NULL);

-- Policy: Allow anonymous users to log views (viewer_id = NULL)
CREATE POLICY "Anonymous users can log views"
  ON project_views_log
  FOR INSERT
  TO anon
  WITH CHECK (viewer_id IS NULL);

-- ============================================
-- 2. USER CHARTER ACCEPTANCES
-- ============================================
-- Records user acceptance of terms/charter (contains sensitive data: IP addresses)

-- Enable RLS
ALTER TABLE user_charter_acceptances ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only view their own charter acceptances
CREATE POLICY "Users can view their own charter acceptances"
  ON user_charter_acceptances
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Policy: Users can insert their own charter acceptances
CREATE POLICY "Users can record their own charter acceptance"
  ON user_charter_acceptances
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Policy: Service role has full access (for admin/moderation)
CREATE POLICY "Service role can manage charter acceptances"
  ON user_charter_acceptances
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================

COMMENT ON TABLE project_views_log IS
  'Analytics table tracking project views. Contains user_agent and IP addresses for traceability.';

COMMENT ON TABLE user_charter_acceptances IS
  'Records user acceptance of terms and charter. Contains IP addresses (sensitive data).';
