-- ============================================
-- MIGRATION 031: Enable RLS on spatial_ref_sys
-- ============================================
-- Fix Supabase security warning: RLS disabled on public.spatial_ref_sys
--
-- spatial_ref_sys is a PostGIS system table containing spatial reference systems (SRID)
-- It's a read-only reference table with public data, so we enable RLS with read-only access

-- Enable RLS on spatial_ref_sys
ALTER TABLE spatial_ref_sys ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read spatial reference systems (public reference data)
CREATE POLICY "Allow public read access to spatial reference systems"
  ON spatial_ref_sys
  FOR SELECT
  TO public
  USING (true);

-- Add comment for documentation
COMMENT ON TABLE spatial_ref_sys IS
  'PostGIS system table containing spatial reference systems (SRID). Read-only public reference data.';
