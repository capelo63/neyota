-- ============================================
-- Migration 053: Corriger les coordonnées GPS dans profiles_public
-- ============================================
-- Les colonnes profiles.latitude / profiles.longitude sont NULL
-- pour la majorité des profils (update_profile_location écrit
-- uniquement dans profiles.location de type geography PostGIS).
-- On recréé la vue profiles_public en lisant les coordonnées
-- depuis profiles.location via ST_Y() / ST_X().
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
  bio,
  max_distance_km,
  avatar_url,
  created_at,
  updated_at,
  CASE WHEN location IS NOT NULL
       THEN ROUND(ST_Y(location::geometry)::NUMERIC, 2)::FLOAT8 END AS latitude,
  CASE WHEN location IS NOT NULL
       THEN ROUND(ST_X(location::geometry)::NUMERIC, 2)::FLOAT8 END AS longitude
FROM profiles;

GRANT SELECT ON profiles_public TO anon, authenticated;

DO $$ BEGIN
  RAISE NOTICE '✓ Migration 053 : profiles_public mise à jour pour lire les coordonnées depuis profiles.location (ST_Y / ST_X).';
END $$;
