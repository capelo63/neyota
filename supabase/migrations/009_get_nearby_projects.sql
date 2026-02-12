-- Function to get nearby projects for matching
-- Drop existing function first
DROP FUNCTION IF EXISTS get_nearby_projects(double precision, double precision, double precision);

-- Create new function with owner information
CREATE OR REPLACE FUNCTION get_nearby_projects(
  user_lat DOUBLE PRECISION,
  user_lng DOUBLE PRECISION,
  max_distance_km DOUBLE PRECISION
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_location geography;
  result JSONB;
BEGIN
  -- Create geography point from user coordinates
  user_location := ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography;

  -- Return projects with owner information as JSONB
  SELECT jsonb_agg(
    jsonb_build_object(
      'id', p.id,
      'title', p.title,
      'short_pitch', p.short_pitch,
      'full_description', p.full_description,
      'current_phase', p.current_phase,
      'city', p.city,
      'postal_code', p.postal_code,
      'region', p.region,
      'is_remote_possible', p.is_remote_possible,
      'preferred_radius_km', p.preferred_radius_km,
      'status', p.status,
      'created_at', p.created_at,
      'owner_id', p.owner_id,
      'owner', jsonb_build_object(
        'first_name', pr.first_name,
        'last_name', pr.last_name,
        'city', pr.city
      ),
      'distance_km', CASE
        WHEN p.location IS NOT NULL
        THEN ROUND((ST_Distance(user_location, p.location) / 1000)::numeric, 2)
        ELSE NULL
      END
    )
    ORDER BY
      CASE
        WHEN p.location IS NOT NULL
        THEN ST_Distance(user_location, p.location)
        ELSE 999999999
      END
  )
  INTO result
  FROM projects p
  INNER JOIN profiles pr ON pr.id = p.owner_id
  WHERE p.status = 'active'
    AND (
      -- Project within max distance
      (
        p.location IS NOT NULL
        AND ST_DWithin(user_location, p.location, max_distance_km * 1000)
      )
      -- OR remote is possible
      OR p.is_remote_possible = TRUE
    );

  RETURN COALESCE(result, '[]'::jsonb);
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_nearby_projects TO authenticated, anon;
