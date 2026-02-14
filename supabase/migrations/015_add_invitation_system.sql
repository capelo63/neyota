-- Add invitation system to applications table
-- This allows entrepreneurs to invite talents to their projects (reverse of application)

-- Add invited_by column to track if this is an invitation vs a regular application
ALTER TABLE applications
ADD COLUMN invited_by UUID REFERENCES profiles(id) ON DELETE SET NULL;

-- Add comment for clarity
COMMENT ON COLUMN applications.invited_by IS
  'If not null, this application was created by an entrepreneur inviting the talent (instead of talent applying)';

-- Create index for faster queries on invitations
CREATE INDEX idx_applications_invited_by ON applications(invited_by) WHERE invited_by IS NOT NULL;

-- Update RLS policy to allow entrepreneurs to create invitations
-- Drop existing insert policy
DROP POLICY IF EXISTS "Talents can create applications" ON applications;

-- Create new insert policy that allows both talents applying AND entrepreneurs inviting
CREATE POLICY "Users can create applications or invitations"
  ON applications
  FOR INSERT
  TO authenticated
  WITH CHECK (
    -- Talent applying to a project
    (auth.uid() = talent_id AND invited_by IS NULL)
    OR
    -- Entrepreneur inviting a talent to their project
    (auth.uid() = invited_by AND project_id IN (
      SELECT id FROM projects WHERE owner_id = auth.uid()
    ))
  );
