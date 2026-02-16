-- Migration: Fix ambiguous project status by creating ENUM type
-- This migration transforms the TEXT status column into a proper ENUM type
-- for better data integrity and type safety

-- ============================================
-- Step 1: Create the project_status ENUM type
-- ============================================

CREATE TYPE project_status AS ENUM (
  'active',    -- Projet actif et visible
  'closed',    -- Projet fermé (objectif atteint ou abandonné)
  'archived'   -- Projet archivé
);

-- ============================================
-- Step 2: Drop ALL RLS policies on projects table
-- ============================================

-- PostgreSQL doesn't allow altering column types used in ANY policy definition
-- We must drop ALL policies on the table, not just those using the column
DROP POLICY IF EXISTS "Anyone can view active projects" ON projects;
DROP POLICY IF EXISTS "Active projects are viewable by everyone" ON projects;
DROP POLICY IF EXISTS "Public can view active projects" ON projects;
DROP POLICY IF EXISTS "Entrepreneurs can create projects" ON projects;
DROP POLICY IF EXISTS "Project owners can update their projects" ON projects;
DROP POLICY IF EXISTS "Project owners can delete their projects" ON projects;

-- ============================================
-- Step 3: Remove the existing DEFAULT constraint
-- ============================================

ALTER TABLE projects
ALTER COLUMN status DROP DEFAULT;

-- ============================================
-- Step 4: Update any non-standard values to 'active'
-- ============================================

-- First, let's check for any values that don't match our ENUM
-- and standardize them to 'active' (safest default)
UPDATE projects
SET status = 'active'
WHERE status NOT IN ('active', 'closed', 'archived')
   OR status IS NULL;

-- ============================================
-- Step 5: Convert the column to use the ENUM
-- ============================================

ALTER TABLE projects
ALTER COLUMN status TYPE project_status
USING status::project_status;

-- ============================================
-- Step 6: Set the new DEFAULT value with correct type
-- ============================================

ALTER TABLE projects
ALTER COLUMN status SET DEFAULT 'active'::project_status;

-- ============================================
-- Step 7: Recreate ALL RLS policies with the new ENUM type
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
-- Step 8: Add comments for documentation
-- ============================================

COMMENT ON COLUMN projects.status IS 'Project status: active (visible and accepting applications), closed (no longer accepting applications), archived (historical record)';
COMMENT ON TYPE project_status IS 'ENUM type for project status: ensures data integrity and prevents ambiguous status values';
