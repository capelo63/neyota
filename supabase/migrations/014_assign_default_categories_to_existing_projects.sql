-- Assign default category to existing projects without categories
-- This migration ensures all existing projects have at least one category
-- as required by the new category system

-- Insert 'services' category for all projects that don't have any category yet
INSERT INTO project_categories (project_id, category)
SELECT id, 'services'
FROM projects
WHERE NOT EXISTS (
  SELECT 1
  FROM project_categories
  WHERE project_id = projects.id
)
AND status = 'active';

-- Log result
-- This will show how many projects were updated
SELECT
  COUNT(*) as projects_updated,
  'Added default "services" category to existing projects' as message
FROM projects p
WHERE EXISTS (
  SELECT 1
  FROM project_categories pc
  WHERE pc.project_id = p.id
  AND pc.category = 'services'
)
AND p.status = 'active';
