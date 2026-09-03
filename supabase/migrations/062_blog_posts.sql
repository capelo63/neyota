-- ============================================
-- Migration 062 : module Blog/Actualités
-- ============================================

-- Table des articles
CREATE TABLE IF NOT EXISTS blog_posts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title           TEXT NOT NULL,
  slug            TEXT NOT NULL UNIQUE,
  excerpt         TEXT CHECK (char_length(excerpt) <= 200),
  content         TEXT NOT NULL DEFAULT '',
  cover_image_url TEXT,
  category        TEXT NOT NULL CHECK (category IN ('actualites', 'initiatives', 'temoignages', 'ressources', 'evenements')),
  author_id       UUID REFERENCES profiles(id) ON DELETE SET NULL,
  status          TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  published_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_blog_posts_slug    ON blog_posts (slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_status  ON blog_posts (status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_category ON blog_posts (category);

-- Trigger updated_at
CREATE OR REPLACE FUNCTION update_blog_posts_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_blog_posts_updated_at ON blog_posts;
CREATE TRIGGER trg_blog_posts_updated_at
  BEFORE UPDATE ON blog_posts
  FOR EACH ROW EXECUTE FUNCTION update_blog_posts_updated_at();

-- RLS
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

-- Lecture publique : articles publiés uniquement
CREATE POLICY "blog_posts_select_published"
  ON blog_posts FOR SELECT
  TO public
  USING (status = 'published');

-- Lecture admin : tous les articles
CREATE POLICY "blog_posts_select_admin"
  ON blog_posts FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.is_admin = true
    )
  );

-- Écriture (INSERT/UPDATE/DELETE) : admins uniquement
CREATE POLICY "blog_posts_insert_admin"
  ON blog_posts FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.is_admin = true
    )
  );

CREATE POLICY "blog_posts_update_admin"
  ON blog_posts FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.is_admin = true
    )
  );

CREATE POLICY "blog_posts_delete_admin"
  ON blog_posts FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.is_admin = true
    )
  );

GRANT SELECT ON blog_posts TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON blog_posts TO authenticated;

-- Bucket de stockage pour les couvertures d'articles
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'blog-covers',
  'blog-covers',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Politique de lecture publique sur le bucket (bucket public, objets lisibles par tous)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename  = 'objects'
      AND policyname = 'blog_covers_public_read'
  ) THEN
    EXECUTE $pol$
      CREATE POLICY "blog_covers_public_read"
        ON storage.objects FOR SELECT
        TO public
        USING (bucket_id = 'blog-covers')
    $pol$;
  END IF;
END;
$$;

-- Politique d'écriture admin sur le bucket
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename  = 'objects'
      AND policyname = 'blog_covers_admin_write'
  ) THEN
    EXECUTE $pol$
      CREATE POLICY "blog_covers_admin_write"
        ON storage.objects FOR INSERT
        TO authenticated
        WITH CHECK (
          bucket_id = 'blog-covers'
          AND EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
              AND profiles.is_admin = true
          )
        )
    $pol$;
  END IF;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename  = 'objects'
      AND policyname = 'blog_covers_admin_delete'
  ) THEN
    EXECUTE $pol$
      CREATE POLICY "blog_covers_admin_delete"
        ON storage.objects FOR DELETE
        TO authenticated
        USING (
          bucket_id = 'blog-covers'
          AND EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
              AND profiles.is_admin = true
          )
        )
    $pol$;
  END IF;
END;
$$;

DO $$ BEGIN
  RAISE NOTICE '✓ Migration 062 : table blog_posts + bucket blog-covers créés.';
END $$;
