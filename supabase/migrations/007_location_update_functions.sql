-- Function to update profile location with proper PostGIS format
CREATE OR REPLACE FUNCTION update_profile_location(
  user_id UUID,
  lng DOUBLE PRECISION,
  lat DOUBLE PRECISION
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE profiles
  SET location = ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography,
      updated_at = NOW()
  WHERE id = user_id;
END;
$$;

-- Function to update project location with proper PostGIS format
CREATE OR REPLACE FUNCTION update_project_location(
  project_id UUID,
  lng DOUBLE PRECISION,
  lat DOUBLE PRECISION
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE projects
  SET location = ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography,
      updated_at = NOW()
  WHERE id = project_id;
END;
$$;
