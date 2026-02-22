-- Migration 027 v2: Add report system for profiles and projects
-- Fixed: drop table first to handle partial previous runs

-- Drop existing table if partial
DROP TABLE IF EXISTS reports CASCADE;

-- Create reports table
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reported_profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  reported_project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  reason TEXT NOT NULL CHECK (reason IN (
    'spam',
    'inappropriate_content',
    'fake_profile',
    'scam',
    'harassment',
    'other'
  )),
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'dismissed', 'actioned')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES auth.users(id),

  -- Ensure a report targets either a profile OR a project, not both
  CONSTRAINT report_target_check CHECK (
    (reported_profile_id IS NOT NULL AND reported_project_id IS NULL) OR
    (reported_profile_id IS NULL AND reported_project_id IS NOT NULL)
  )
);

-- Indexes
CREATE INDEX idx_reports_status ON reports(status);
CREATE INDEX idx_reports_profile ON reports(reported_profile_id) WHERE reported_profile_id IS NOT NULL;
CREATE INDEX idx_reports_project ON reports(reported_project_id) WHERE reported_project_id IS NOT NULL;
CREATE INDEX idx_reports_reporter ON reports(reporter_id);

-- Partial unique indexes to prevent duplicate reports (handles NULL correctly)
CREATE UNIQUE INDEX idx_reports_unique_profile
  ON reports(reporter_id, reported_profile_id)
  WHERE reported_profile_id IS NOT NULL;

CREATE UNIQUE INDEX idx_reports_unique_project
  ON reports(reporter_id, reported_project_id)
  WHERE reported_project_id IS NOT NULL;

-- Enable RLS
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Policy: Users can create reports
CREATE POLICY "Users can create reports" ON reports
  FOR INSERT
  WITH CHECK (auth.uid() = reporter_id);

-- Policy: Users can see their own reports
CREATE POLICY "Users can view own reports" ON reports
  FOR SELECT
  USING (auth.uid() = reporter_id);

-- Policy: Users can delete their own pending reports
CREATE POLICY "Users can delete own pending reports" ON reports
  FOR DELETE
  USING (auth.uid() = reporter_id AND status = 'pending');

-- Drop old versions of functions if exist
DROP FUNCTION IF EXISTS has_already_reported(UUID, UUID, UUID);
DROP FUNCTION IF EXISTS get_profile_report_count(UUID);
DROP FUNCTION IF EXISTS get_project_report_count(UUID);

-- Function: Check if a user has already reported a profile or project
CREATE FUNCTION has_already_reported(
  p_reporter_id UUID,
  p_profile_id UUID DEFAULT NULL,
  p_project_id UUID DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF p_profile_id IS NOT NULL THEN
    RETURN EXISTS (
      SELECT 1 FROM reports
      WHERE reporter_id = p_reporter_id
        AND reported_profile_id = p_profile_id
    );
  ELSIF p_project_id IS NOT NULL THEN
    RETURN EXISTS (
      SELECT 1 FROM reports
      WHERE reporter_id = p_reporter_id
        AND reported_project_id = p_project_id
    );
  END IF;
  RETURN FALSE;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION has_already_reported(UUID, UUID, UUID) TO authenticated;
