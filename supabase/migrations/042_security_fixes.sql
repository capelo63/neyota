-- ============================================
-- Migration 042: Corrections de sécurité
-- ============================================
-- M1 : Vue projects_public sans coordonnées ni champs sensibles
-- M2 : Vue profiles_public sans coordonnées
-- M3 : SET search_path = public sur les fonctions SECURITY DEFINER existantes
-- m3 : REVOKE anon sur get_nearby_projects
-- ============================================

-- ============================================
-- M1 : Vue projects_public
-- ============================================

CREATE OR REPLACE VIEW projects_public AS
SELECT
  id,
  title,
  short_pitch,
  current_phase,
  city,
  postal_code,
  region,
  department,
  is_remote_possible,
  preferred_radius_km,
  status,
  owner_id,
  created_at,
  updated_at
FROM projects;

-- Policy anon sur la vue (lecture des projets actifs)
GRANT SELECT ON projects_public TO anon, authenticated;

-- ============================================
-- M2 : Vue profiles_public
-- ============================================

CREATE OR REPLACE VIEW profiles_public AS
SELECT
  id,
  first_name,
  last_name,
  role,
  city,
  postal_code,
  region,
  department,
  bio,
  max_distance_km,
  availability,
  is_profile_complete,
  avatar_url,
  created_at,
  updated_at
FROM profiles;

-- Policy anon sur la vue
GRANT SELECT ON profiles_public TO anon, authenticated;

-- ============================================
-- M3 : SET search_path = public sur les fonctions SECURITY DEFINER
-- ============================================

-- get_talent_profile_with_coords (migration 008)
DROP FUNCTION IF EXISTS get_talent_profile_with_coords(UUID);

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
SET search_path = public
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

GRANT EXECUTE ON FUNCTION get_talent_profile_with_coords TO authenticated;

-- get_nearby_projects (migration 009)
DROP FUNCTION IF EXISTS get_nearby_projects(double precision, double precision, double precision);

CREATE OR REPLACE FUNCTION get_nearby_projects(
  user_lat DOUBLE PRECISION,
  user_lng DOUBLE PRECISION,
  search_radius_km DOUBLE PRECISION
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_location geography;
  result JSONB;
BEGIN
  user_location := ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography;

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
      (
        p.location IS NOT NULL
        AND ST_DWithin(user_location, p.location, search_radius_km * 1000)
      )
      OR p.is_remote_possible = TRUE
    );

  RETURN COALESCE(result, '[]'::jsonb);
END;
$$;

-- m3 : accessible aux utilisateurs authentifiés uniquement
GRANT EXECUTE ON FUNCTION get_nearby_projects TO authenticated;
REVOKE EXECUTE ON FUNCTION get_nearby_projects FROM anon;

DO $$ BEGIN
  RAISE NOTICE '✓ Migration 042 : projects_public + profiles_public créées ; search_path fixé sur get_talent_profile_with_coords et get_nearby_projects ; anon révoqué sur get_nearby_projects.';
END $$;
