-- ============================================
-- AVATAR STORAGE SETUP
-- ============================================
-- Setup Supabase Storage for user avatars
-- Created: 2026-02-16

-- ============================================
-- Create Storage Bucket
-- ============================================

-- Create avatars bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- Storage Policies
-- ============================================

-- Allow users to upload their own avatar
CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to update their own avatar
CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to delete their own avatar
CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow everyone to view avatars (public bucket)
CREATE POLICY "Anyone can view avatars"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');

-- ============================================
-- Helper Function: Get Avatar URL
-- ============================================

CREATE OR REPLACE FUNCTION get_avatar_public_url(avatar_path TEXT)
RETURNS TEXT
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
  IF avatar_path IS NULL OR avatar_path = '' THEN
    RETURN NULL;
  END IF;

  -- Return the public URL for the avatar
  -- Format: {SUPABASE_URL}/storage/v1/object/public/avatars/{path}
  RETURN avatar_path;
END;
$$;

-- ============================================
-- Comments
-- ============================================

COMMENT ON FUNCTION get_avatar_public_url(TEXT) IS
'Returns the public URL for a given avatar path. Returns NULL if path is empty.';
