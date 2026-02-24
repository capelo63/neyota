-- Migration 030: Auto-create profile via trigger on auth.users
--
-- PROBLEM: When email confirmation is enabled, signUp() can return a "ghost"
-- user whose UUID doesn't yet exist in auth.users (e.g. duplicate email attempt).
-- The RPC create_user_profile then fails with FK violation 23503.
--
-- SOLUTION: Create a trigger that fires on INSERT in auth.users and creates
-- the profile automatically. This is the canonical Supabase pattern and is
-- immune to timing issues and duplicate-email ghost users.

-- Function called by the trigger
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    role,
    first_name,
    last_name,
    postal_code,
    city
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'role', 'talent')::user_role,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    '00000',       -- placeholder, completed during onboarding
    'À définir'   -- placeholder, completed during onboarding
  )
  ON CONFLICT (id) DO NOTHING;  -- safe to call multiple times

  RETURN NEW;
END;
$$;

-- Drop existing trigger if any, then create
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_auth_user();
