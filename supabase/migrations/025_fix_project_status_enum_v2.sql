-- Migration: Fix ambiguous project status by creating ENUM type (VERSION 2 - Dynamic)
-- This migration dynamically drops ALL policies on projects table before conversion
-- This handles any custom policies that may have been created manually

-- ============================================
-- Step 1: Create the project_status ENUM type (if not exists)
-- ============================================

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'project_status') THEN
    CREATE TYPE project_status AS ENUM (
      'active',    -- Projet actif et visible
      'closed',    -- Projet fermé (objectif atteint ou abandonné)
      'archived'   -- Projet archivé
    );
  END IF;
END $$;

-- ============================================
-- Step 2: Dynamically drop ALL policies on projects table
-- ============================================

DO $$
DECLARE
  policy_record RECORD;
BEGIN
  -- Loop through all policies on the projects table and drop them
  FOR policy_record IN
    SELECT policyname
    FROM pg_policies
    WHERE tablename = 'projects' AND schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON projects', policy_record.policyname);
    RAISE NOTICE 'Dropped policy: %', policy_record.policyname;
  END LOOP;
END $$;

-- ============================================
-- Step 3: Remove the existing DEFAULT constraint
-- ============================================

DO $$
BEGIN
  -- Only drop default if column is not already project_status type
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'projects'
    AND column_name = 'status'
    AND data_type = 'text'
  ) THEN
    ALTER TABLE projects ALTER COLUMN status DROP DEFAULT;
  END IF;
END $$;

-- ============================================
-- Step 4: Update any non-standard values to 'active'
-- ============================================

UPDATE projects
SET status = 'active'
WHERE status NOT IN ('active', 'closed', 'archived')
   OR status IS NULL;

-- ============================================
-- Step 5: Convert the column to use the ENUM (if not already converted)
-- ============================================

DO $$
BEGIN
  -- Only convert if column is still TEXT type
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'projects'
    AND column_name = 'status'
    AND data_type = 'text'
  ) THEN
    ALTER TABLE projects
    ALTER COLUMN status TYPE project_status
    USING status::project_status;

    RAISE NOTICE 'Column status converted to project_status ENUM';
  ELSE
    RAISE NOTICE 'Column status is already of type project_status';
  END IF;
END $$;

-- ============================================
-- Step 6: Set the new DEFAULT value with correct type
-- ============================================

ALTER TABLE projects
ALTER COLUMN status SET DEFAULT 'active'::project_status;

-- ============================================
-- Step 7: Recreate the standard RLS policies
-- ============================================

-- Policy 1: Anyone (anon + authenticated) can view active projects
CREATE POLICY "Anyone can view active projects"
  ON projects
  FOR SELECT
  TO public, anon, authenticated
  USING (status = 'active'::project_status);

-- Policy 2: Entrepreneurs can create projects
CREATE POLICY "Entrepreneurs can create projects"
  ON projects
  FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

-- Policy 3: Project owners can update their projects
CREATE POLICY "Project owners can update their projects"
  ON projects
  FOR UPDATE
  USING (auth.uid() = owner_id);

-- Policy 4: Project owners can delete their projects
CREATE POLICY "Project owners can delete their projects"
  ON projects
  FOR DELETE
  USING (auth.uid() = owner_id);

-- ============================================
-- Step 8: Ensure RLS is enabled
-- ============================================

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- ============================================
-- Step 9: Add comments for documentation
-- ============================================

COMMENT ON COLUMN projects.status IS 'Project status: active (visible and accepting applications), closed (no longer accepting applications), archived (historical record)';
COMMENT ON TYPE project_status IS 'ENUM type for project status: ensures data integrity and prevents ambiguous status values';

-- ============================================
-- Success message
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '✅ Migration completed successfully!';
  RAISE NOTICE 'Column projects.status is now of type project_status ENUM';
  RAISE NOTICE 'All RLS policies have been recreated';
END $$;
