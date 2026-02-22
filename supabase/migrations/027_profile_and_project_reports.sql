-- Migration: Add report system for profiles and projects
-- Allows users to flag inappropriate content for moderation

-- Create reports table
CREATE TABLE IF NOT EXISTS reports (
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
  ),

  -- Prevent duplicate reports from the same user
  CONSTRAINT unique_profile_report UNIQUE (reporter_id, reported_profile_id),
  CONSTRAINT unique_project_report UNIQUE (reporter_id, reported_project_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_profile ON reports(reported_profile_id);
CREATE INDEX IF NOT EXISTS idx_reports_project ON reports(reported_project_id);
CREATE INDEX IF NOT EXISTS idx_reports_reporter ON reports(reporter_id);

-- Enable RLS
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Policy: Users can create reports (but not see others' reports)
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

-- Function: Check if a user has already reported a profile or project
CREATE OR REPLACE FUNCTION has_already_reported(
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

-- Function: Get report count for a profile (for admin view)
CREATE OR REPLACE FUNCTION get_profile_report_count(p_profile_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN (
    SELECT COUNT(*) FROM reports
    WHERE reported_profile_id = p_profile_id
    AND status = 'pending'
  );
END;
$$;

-- Function: Get report count for a project
CREATE OR REPLACE FUNCTION get_project_report_count(p_project_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN (
    SELECT COUNT(*) FROM reports
    WHERE reported_project_id = p_project_id
    AND status = 'pending'
  );
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION has_already_reported(UUID, UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_profile_report_count(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_project_report_count(UUID) TO authenticated;
