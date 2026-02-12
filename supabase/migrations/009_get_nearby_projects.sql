-- Function to get nearby projects for matching
CREATE OR REPLACE FUNCTION get_nearby_projects(
  user_lat DOUBLE PRECISION,
  user_lng DOUBLE PRECISION,
  max_distance_km DOUBLE PRECISION
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  short_pitch TEXT,
  full_description TEXT,
  current_phase project_phase,
  city TEXT,
  postal_code TEXT,
  region TEXT,
  is_remote_possible BOOLEAN,
  preferred_radius_km INTEGER,
  status TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  owner_id UUID,
  distance_km DOUBLE PRECISION
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_location geography;
BEGIN
  -- Create geography point from user coordinates
  user_location := ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography;

  -- Return projects within distance
  RETURN QUERY
  SELECT
    p.id,
    p.title,
    p.short_pitch,
    p.full_description,
    p.current_phase,
    p.city,
    p.postal_code,
    p.region,
    p.is_remote_possible,
    p.preferred_radius_km,
    p.status,
    p.created_at,
    p.owner_id,
    CASE
      WHEN p.location IS NOT NULL
      THEN ROUND((ST_Distance(user_location, p.location) / 1000)::numeric, 2)::DOUBLE PRECISION
      ELSE NULL
    END AS distance_km
  FROM projects p
  WHERE p.status = 'active'
    AND (
      -- Project within max distance
      (
        p.location IS NOT NULL
        AND ST_DWithin(user_location, p.location, max_distance_km * 1000)
      )
      -- OR remote is possible
      OR p.is_remote_possible = TRUE
    )
  ORDER BY
    CASE
      WHEN p.location IS NOT NULL
      THEN ST_Distance(user_location, p.location)
      ELSE 999999999 -- Remote projects at the end
    END;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_nearby_projects TO authenticated, anon;
