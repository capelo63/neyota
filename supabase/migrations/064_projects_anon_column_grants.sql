-- ============================================
-- Migration 064 : lecture anonyme de public.projects limitée par colonnes
-- ============================================
-- DÉJÀ APPLIQUÉE MANUELLEMENT en base (SQL Editor). Ce fichier sert de
-- trace et peut être rejoué sans erreur : le résultat final est toujours
-- le même (anon ne lit que les 10 colonnes listées ci-dessous).
--
-- Périmètre : uniquement la table public.projects, uniquement le rôle anon.
-- authenticated, service_role et la RLS ne sont pas modifiés.
--
-- Colonnes lisibles par anon :
--   id, title, short_pitch, current_phase, city, region,
--   is_remote_possible, status, created_at, updated_at
-- Toutes les autres (owner_id, postal_code, preferred_radius_km,
-- full_description, phase_objectives, coordonnées, location…) deviennent
-- illisibles pour anon : un SELECT anon doit nommer ses colonnes
-- (select('*') échoue).
-- ============================================

BEGIN;

-- 1. Retirer à anon le droit de lecture au niveau de la table
REVOKE SELECT ON public.projects FROM anon;

-- 2. Retirer à anon les droits de lecture par colonne de cette table
--    (état de départ exact, quel que soit l'historique des GRANT)
DO $$
DECLARE
  col RECORD;
BEGIN
  FOR col IN
    SELECT a.attname
    FROM pg_attribute a
    WHERE a.attrelid = 'public.projects'::regclass
      AND a.attnum > 0
      AND NOT a.attisdropped
  LOOP
    EXECUTE format(
      'REVOKE SELECT (%I) ON public.projects FROM anon',
      col.attname
    );
  END LOOP;
END $$;

-- 3. Accorder à anon uniquement les colonnes d'aperçu
GRANT SELECT (
  id,
  title,
  short_pitch,
  current_phase,
  city,
  region,
  is_remote_possible,
  status,
  created_at,
  updated_at
) ON public.projects TO anon;

COMMIT;
