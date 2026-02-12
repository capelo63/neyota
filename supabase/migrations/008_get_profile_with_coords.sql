-- Function to get talent profile with extracted coordinates
CREATE OR REPLACE FUNCTION get_talent_profile_with_coords(talent_id UUID)
RETURNS TABLE (
  id UUID,
  first_name TEXT,
  last_name TEXT,
  city TEXT,
  postal_code TEXT,
  max_distance_km INTEGER,
  role user_role,
  lng DOUBLE PRECISION,
  lat DOUBLE PRECISION
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.first_name,
    p.last_name,
    p.city,
    p.postal_code,
    p.max_distance_km,
    p.role,
    ST_X(p.location::geometry) as lng,
    ST_Y(p.location::geometry) as lat
  FROM profiles p
  WHERE p.id = talent_id;
END;
$$;
