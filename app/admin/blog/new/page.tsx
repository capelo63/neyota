'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Navigation from '@/components/Navigation';
import TiptapEditor from '@/components/blog/TiptapEditor';
import { BLOG_CATEGORIES, BlogCategory } from '@/lib/constants/blog';

function toSlug(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export default function NewBlogPostPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [slugManual, setSlugManual] = useState(false);
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<BlogCategory>('actualites');
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleTitleChange(value: string) {
    setTitle(value);
    if (!slugManual) {
      setSlug(toSlug(value));
    }
  }

  function handleSlugChange(value: string) {
    setSlugManual(true);
    setSlug(toSlug(value));
  }

  function handleCoverChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setCoverFile(file);
    if (file) {
      const url = URL.createObjectURL(file);
      setCoverPreview(url);
    } else {
      setCoverPreview(null);
    }
  }

  async function handleSubmit(status: 'draft' | 'published') {
    if (!title.trim() || !slug.trim()) {
      setError('Le titre et le slug sont obligatoires.');
      return;
    }
    setSubmitting(true);
    setError(null);

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }

      let cover_image_url: string | null = null;

      if (coverFile) {
        const ext = coverFile.name.split('.').pop();
        const path = `${slug}-${Date.now()}.${ext}`;
        const { error: uploadErr } = await supabase.storage
          .from('blog-covers')
          .upload(path, coverFile, { upsert: true });
        if (uploadErr) throw uploadErr;
        const { data: urlData } = supabase.storage.from('blog-covers').getPublicUrl(path);
        cover_image_url = urlData.publicUrl;
      }

      const { error: insertErr } = await supabase.from('blog_posts').insert({
        title: title.trim(),
        slug: slug.trim(),
        excerpt: excerpt.trim() || null,
        content,
        category,
        cover_image_url,
        author_id: user.id,
        status,
        published_at: status === 'published' ? new Date().toISOString() : null,
      });

      if (insertErr) throw insertErr;
      router.push('/admin/blog');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue.');
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navigation />
      <main className="max-w-3xl mx-auto px-4 py-12">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 bg-amber-50 text-amber-700 text-xs font-medium px-3 py-1 rounded-full mb-4">
            Administration
          </div>
          <h1 className="text-2xl font-bold text-neutral-900">Nouvel article</h1>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <div className="bg-white rounded-xl border border-neutral-200 p-6 space-y-6">
          {/* Titre */}
          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-1">
              Titre <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="Titre de l'article"
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>

          {/* Slug */}
          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-1">
              Slug <span className="text-red-500">*</span>
              <span className="font-normal text-neutral-400 ml-2 text-xs">(URL : /blog/slug)</span>
            </label>
            <input
              type="text"
              value={slug}
              onChange={(e) => handleSlugChange(e.target.value)}
              placeholder="mon-article"
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 font-mono"
            />
          </div>

          {/* Catégorie */}
          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-1">Catégorie</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as BlogCategory)}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white"
            >
              {(Object.entries(BLOG_CATEGORIES) as [BlogCategory, string][]).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>

          {/* Extrait */}
          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-1">
              Extrait
              <span className="font-normal text-neutral-400 ml-2 text-xs">({excerpt.length}/200 caractères)</span>
            </label>
            <textarea
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value.slice(0, 200))}
              placeholder="Résumé court de l'article (affiché dans la liste)"
              rows={3}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
            />
          </div>

          {/* Image de couverture */}
          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-1">
              Image de couverture
              <span className="font-normal text-neutral-400 ml-2 text-xs">JPEG, PNG ou WebP · max 5 Mo</span>
            </label>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleCoverChange}
              className="w-full text-sm text-neutral-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-medium file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100"
            />
            {coverPreview && (
              <img
                src={coverPreview}
                alt="Aperçu"
                className="mt-3 max-h-48 rounded-lg object-cover border border-neutral-200"
              />
            )}
          </div>

          {/* Contenu */}
          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-1">Contenu</label>
            <TiptapEditor content={content} onChange={setContent} />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 mt-6">
          <button
            onClick={() => handleSubmit('published')}
            disabled={submitting}
            className="bg-amber-500 hover:bg-amber-600 text-white font-semibold px-5 py-2 rounded-lg transition-colors disabled:opacity-50 text-sm"
          >
            {submitting ? 'Enregistrement…' : 'Publier'}
          </button>
          <button
            onClick={() => handleSubmit('draft')}
            disabled={submitting}
            className="bg-white hover:bg-neutral-50 text-neutral-700 font-medium px-5 py-2 rounded-lg border border-neutral-200 transition-colors disabled:opacity-50 text-sm"
          >
            Enregistrer en brouillon
          </button>
          <button
            onClick={() => router.push('/admin/blog')}
            className="text-sm text-neutral-500 hover:text-neutral-700 ml-2 transition-colors"
          >
            Annuler
          </button>
        </div>
      </main>
    </div>
  );
}
