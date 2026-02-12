-- Helper script to update profiles that have postal codes but no coordinates
-- This is useful for profiles created before the geolocation system was fixed

-- Note: This script uses a placeholder for the French geocoding API
-- You would need to run this through a script that calls the API for each postal code

-- Option 1: Update a specific profile manually with known coordinates
-- Example for Paris (75001):
-- SELECT update_profile_location(
--   'USER_UUID_HERE'::uuid,
--   2.3488,  -- longitude
--   48.8534  -- latitude
-- );

-- Option 2: List all profiles without coordinates
SELECT
  id,
  first_name,
  last_name,
  postal_code,
  city,
  CASE
    WHEN location IS NULL THEN 'No location'
    WHEN ST_X(location::geometry) IS NULL THEN 'Invalid location'
    ELSE 'Has location'
  END as location_status
FROM profiles
WHERE postal_code != '00000'
  AND (
    location IS NULL
    OR ST_X(location::geometry) IS NULL
  )
ORDER BY created_at DESC;

-- Option 3: Update a specific user's coordinates
-- Replace USER_ID, LONGITUDE, and LATITUDE with actual values
-- SELECT update_profile_location(
--   'USER_ID'::uuid,
--   LONGITUDE,
--   LATITUDE
-- );

-- Example coordinates for major French cities (for manual updates):
-- Paris: lng=2.3488, lat=48.8534
-- Marseille: lng=5.3698, lat=43.2965
-- Lyon: lng=4.8357, lat=45.7640
-- Toulouse: lng=1.4442, lat=43.6047
-- Nice: lng=7.2620, lat=43.7102
-- Nantes: lng=-1.5536, lat=47.2184
-- Strasbourg: lng=7.7521, lat=48.5734
-- Montpellier: lng=3.8767, lat=43.6108
-- Bordeaux: lng=-0.5792, lat=44.8378
-- Lille: lng=3.0573, lat=50.6292
