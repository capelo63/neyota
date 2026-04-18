-- ============================================
-- MIGRATION 035: Robust RLS enablement for spatial_ref_sys
-- ============================================
-- This migration provides a robust approach to enable RLS on the
-- PostGIS system table `spatial_ref_sys` that addresses the Supabase
-- security linter warning: `rls_disabled_in_public`.
--
-- Context:
-- - `spatial_ref_sys` is created automatically by the PostGIS extension
-- - It contains public reference data (spatial reference systems / SRIDs)
-- - It is owned by `supabase_admin` on managed Supabase projects, which
--   means direct ALTER TABLE may fail with insufficient privileges
-- - Migration 031 attempted a simple ALTER TABLE but may fail silently
--   on some Supabase projects depending on the role executing it
--
-- This migration:
-- 1. Tries multiple strategies in order of preference
-- 2. Uses DO blocks with EXCEPTION handlers to avoid breaking the
--    migration pipeline if permissions are insufficient
-- 3. Logs clear NOTICE messages so you know exactly what happened
-- 4. Is idempotent (safe to run multiple times)
-- ============================================

-- -------------------------------------------------------------
-- STEP 1: Try to enable RLS on spatial_ref_sys
-- -------------------------------------------------------------
DO $$
DECLARE
  v_rls_enabled BOOLEAN;
  v_table_owner TEXT;
BEGIN
  -- Check if the table exists (PostGIS might not be installed)
  IF NOT EXISTS (
    SELECT 1
    FROM pg_tables
    WHERE schemaname = 'public'
      AND tablename = 'spatial_ref_sys'
  ) THEN
    RAISE NOTICE '[035] Table public.spatial_ref_sys does not exist. PostGIS not installed? Skipping.';
    RETURN;
  END IF;

  -- Check current RLS status
  SELECT c.relrowsecurity
    INTO v_rls_enabled
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
   WHERE n.nspname = 'public'
     AND c.relname = 'spatial_ref_sys';

  -- Check current owner (for diagnostics)
  SELECT pg_get_userbyid(c.relowner)
    INTO v_table_owner
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
   WHERE n.nspname = 'public'
     AND c.relname = 'spatial_ref_sys';

  RAISE NOTICE '[035] spatial_ref_sys current state: owner=%, rls_enabled=%',
               v_table_owner, v_rls_enabled;

  IF v_rls_enabled THEN
    RAISE NOTICE '[035] RLS already enabled on spatial_ref_sys. Skipping ALTER TABLE.';
  ELSE
    BEGIN
      EXECUTE 'ALTER TABLE public.spatial_ref_sys ENABLE ROW LEVEL SECURITY';
      RAISE NOTICE '[035] Successfully enabled RLS on spatial_ref_sys.';
    EXCEPTION
      WHEN insufficient_privilege THEN
        RAISE WARNING '[035] Insufficient privileges to enable RLS on spatial_ref_sys (owner=%). '
                      'This is expected on managed Supabase projects. '
                      'You can safely ignore the linter warning for this PostGIS system table, '
                      'or run this migration as supabase_admin via the Dashboard SQL Editor.',
                      v_table_owner;
      WHEN OTHERS THEN
        RAISE WARNING '[035] Unexpected error enabling RLS on spatial_ref_sys: % (SQLSTATE=%)',
                      SQLERRM, SQLSTATE;
    END;
  END IF;
END $$;

-- -------------------------------------------------------------
-- STEP 2: Create a public read-only policy (idempotent)
-- -------------------------------------------------------------
-- Even if RLS is already enabled, we ensure a permissive SELECT policy
-- exists so the table remains publicly readable (it contains public
-- geographic reference data used by PostGIS functions).
DO $$
DECLARE
  v_policy_exists BOOLEAN;
BEGIN
  -- Skip entirely if the table does not exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables
    WHERE schemaname = 'public' AND tablename = 'spatial_ref_sys'
  ) THEN
    RETURN;
  END IF;

  SELECT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'spatial_ref_sys'
      AND policyname = 'Allow public read access to spatial reference systems'
  ) INTO v_policy_exists;

  IF v_policy_exists THEN
    RAISE NOTICE '[035] Public read policy already exists on spatial_ref_sys. Skipping CREATE POLICY.';
  ELSE
    BEGIN
      EXECUTE $POLICY$
        CREATE POLICY "Allow public read access to spatial reference systems"
          ON public.spatial_ref_sys
          FOR SELECT
          TO public
          USING (true)
      $POLICY$;
      RAISE NOTICE '[035] Successfully created public read policy on spatial_ref_sys.';
    EXCEPTION
      WHEN insufficient_privilege THEN
        RAISE WARNING '[035] Insufficient privileges to create policy on spatial_ref_sys. '
                      'Run this migration as supabase_admin via the Dashboard SQL Editor if needed.';
      WHEN OTHERS THEN
        RAISE WARNING '[035] Unexpected error creating policy on spatial_ref_sys: % (SQLSTATE=%)',
                      SQLERRM, SQLSTATE;
    END;
  END IF;
END $$;

-- -------------------------------------------------------------
-- STEP 3: Add documentation comment (best-effort)
-- -------------------------------------------------------------
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_tables
    WHERE schemaname = 'public' AND tablename = 'spatial_ref_sys'
  ) THEN
    BEGIN
      EXECUTE $COMMENT$
        COMMENT ON TABLE public.spatial_ref_sys IS
          'PostGIS system table containing spatial reference systems (SRID). '
          'Read-only public reference data. RLS enabled with public SELECT policy '
          'to satisfy Supabase security linter (rls_disabled_in_public).'
      $COMMENT$;
      RAISE NOTICE '[035] Successfully added documentation comment to spatial_ref_sys.';
    EXCEPTION
      WHEN insufficient_privilege THEN
        RAISE NOTICE '[035] Cannot add COMMENT on spatial_ref_sys (not owner). Non-blocking.';
      WHEN OTHERS THEN
        RAISE NOTICE '[035] Could not add comment on spatial_ref_sys: %', SQLERRM;
    END;
  END IF;
END $$;

-- -------------------------------------------------------------
-- STEP 4: Final verification and report
-- -------------------------------------------------------------
DO $$
DECLARE
  v_rls_enabled BOOLEAN;
  v_policy_count INT;
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables
    WHERE schemaname = 'public' AND tablename = 'spatial_ref_sys'
  ) THEN
    RAISE NOTICE '[035] FINAL: spatial_ref_sys table does not exist. No action taken.';
    RETURN;
  END IF;

  SELECT c.relrowsecurity
    INTO v_rls_enabled
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
   WHERE n.nspname = 'public' AND c.relname = 'spatial_ref_sys';

  SELECT COUNT(*)
    INTO v_policy_count
    FROM pg_policies
   WHERE schemaname = 'public' AND tablename = 'spatial_ref_sys';

  RAISE NOTICE '[035] FINAL STATE: rls_enabled=%, policy_count=%',
               v_rls_enabled, v_policy_count;

  IF v_rls_enabled AND v_policy_count > 0 THEN
    RAISE NOTICE '[035] ✓ spatial_ref_sys is properly secured. Linter warning should disappear.';
  ELSIF NOT v_rls_enabled THEN
    RAISE WARNING '[035] ✗ RLS could not be enabled. The linter warning will persist. '
                  'Recommended workaround: execute this migration in the Supabase Dashboard SQL Editor '
                  '(which runs as postgres), or mark the lint rule as ignored for this table.';
  END IF;
END $$;
