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
-- Step 2: Update any non-standard values to 'active'
-- ============================================

-- First, let's check for any values that don't match our ENUM
-- and standardize them to 'active' (safest default)
UPDATE projects
SET status = 'active'
WHERE status NOT IN ('active', 'closed', 'archived')
   OR status IS NULL;

-- ============================================
-- Step 3: Convert the column to use the ENUM
-- ============================================

ALTER TABLE projects
ALTER COLUMN status TYPE project_status
USING status::project_status;

-- ============================================
-- Step 4: Ensure the default value is properly set
-- ============================================

ALTER TABLE projects
ALTER COLUMN status SET DEFAULT 'active'::project_status;

-- ============================================
-- Step 5: Add a comment for documentation
-- ============================================

COMMENT ON COLUMN projects.status IS 'Project status: active (visible and accepting applications), closed (no longer accepting applications), archived (historical record)';
COMMENT ON TYPE project_status IS 'ENUM type for project status: ensures data integrity and prevents ambiguous status values';
