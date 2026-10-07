-- ============================================
-- Migration 063 : retirer les droits d'écriture inutiles à anon
-- et durcir les privilèges par défaut du schéma public
-- ============================================
-- Contexte : Supabase accorde par défaut ALL sur les nouvelles tables/vues
-- du schéma public à anon et authenticated. Les vues public.profiles_public
-- et public.projects_public (propriétaire postgres) contournent la RLS des
-- tables sources : elles doivent être strictement en lecture seule.
-- Les SELECT existants ne sont PAS modifiés.
-- Les objets d'extension (PostGIS : spatial_ref_sys, geometry_columns,
-- geography_columns…) sont exclus.
-- ============================================

-- 1. Vues publiques : lecture seule
REVOKE ALL ON public.profiles_public, public.projects_public FROM anon, authenticated;
GRANT SELECT ON public.profiles_public, public.projects_public TO anon, authenticated;

-- 2. project_views_log : aucune fonction SQL ni code applicatif n'y écrit.
--    Suppression de la politique d'insertion ouverte à anon.
DROP POLICY IF EXISTS "Anonymous users can log views" ON public.project_views_log;

-- 3. Révocations sur les tables/vues/séquences existantes (hors extensions)
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT c.relname, c.relkind
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
      AND c.relkind IN ('r', 'p', 'v', 'm', 'f', 'S')
      AND c.relname NOT IN ('spatial_ref_sys', 'geometry_columns', 'geography_columns')
      AND NOT EXISTS (
        SELECT 1 FROM pg_depend d
        WHERE d.classid = 'pg_class'::regclass
          AND d.objid = c.oid
          AND d.deptype = 'e'
      )
  LOOP
    IF r.relkind = 'S' THEN
      -- anon : aucun droit sur les séquences
      EXECUTE format('REVOKE ALL ON SEQUENCE public.%I FROM anon', r.relname);
    ELSE
      -- anon : aucune écriture
      EXECUTE format(
        'REVOKE INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER ON TABLE public.%I FROM anon',
        r.relname
      );
      -- authenticated : TRUNCATE/REFERENCES/TRIGGER ne sont jamais soumis à la RLS
      EXECUTE format(
        'REVOKE TRUNCATE, REFERENCES, TRIGGER ON TABLE public.%I FROM authenticated',
        r.relname
      );
    END IF;
  END LOOP;
END $$;

-- 4. Privilèges par défaut des futurs objets créés par postgres
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
  REVOKE ALL ON TABLES FROM anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
  REVOKE ALL ON SEQUENCES FROM anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
  REVOKE TRUNCATE, REFERENCES, TRIGGER ON TABLES FROM authenticated;

-- Idem pour supabase_admin si le rôle courant en a le droit (sans bloquer sinon)
DO $$
BEGIN
  ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public
    REVOKE ALL ON TABLES FROM anon;
  ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public
    REVOKE ALL ON SEQUENCES FROM anon;
  ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public
    REVOKE TRUNCATE, REFERENCES, TRIGGER ON TABLES FROM authenticated;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Defaults supabase_admin non modifiés : %', SQLERRM;
END $$;

-- Désormais, toute nouvelle table/vue à lecture publique doit recevoir un
-- GRANT SELECT ... TO anon explicite (convention du projet, cf. CLAUDE.md).

DO $$ BEGIN
  RAISE NOTICE '✓ Migration 063 : écritures anon retirées, vues publiques en lecture seule, defaults durcis.';
END $$;
