'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import Navigation from '@/components/Navigation';
import { BLOG_CATEGORIES, BLOG_CATEGORY_COLORS, BlogCategory, BlogPost } from '@/lib/constants/blog';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export default function AdminBlogPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    async function init() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }

      const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single();

      if (!profile?.is_admin) { router.push('/dashboard'); return; }

      await loadPosts(supabase);
      setLoading(false);
    }
    init();
  }, [router]);

  async function loadPosts(supabase: ReturnType<typeof createClient>) {
    const { data } = await supabase
      .from('blog_posts')
      .select('*')
      .order('created_at', { ascending: false });
    setPosts((data ?? []) as BlogPost[]);
  }

  async function toggleStatus(post: BlogPost) {
    const supabase = createClient();
    setActionLoading(post.id);
    const newStatus = post.status === 'published' ? 'draft' : 'published';
    const update: Partial<BlogPost> = {
      status: newStatus,
      published_at: newStatus === 'published' ? new Date().toISOString() : post.published_at,
    };
    await supabase.from('blog_posts').update(update).eq('id', post.id);
    await loadPosts(supabase);
    setActionLoading(null);
  }

  async function deletePost(post: BlogPost) {
    if (!confirm(`Supprimer "${post.title}" ? Cette action est irréversible.`)) return;
    const supabase = createClient();
    setActionLoading(post.id);
    await supabase.from('blog_posts').delete().eq('id', post.id);
    setPosts((prev) => prev.filter((p) => p.id !== post.id));
    setActionLoading(null);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <Navigation />
        <div className="flex items-center justify-center py-24">
          <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  const published = posts.filter((p) => p.status === 'published').length;
  const draft = posts.filter((p) => p.status === 'draft').length;

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navigation />
      <main className="max-w-5xl mx-auto px-4 py-12">
        <div className="mb-8 flex items-start justify-between">
          <div>
            <div className="inline-flex items-center gap-2 bg-amber-50 text-amber-700 text-xs font-medium px-3 py-1 rounded-full mb-4">
              Administration
            </div>
            <h1 className="text-2xl font-bold text-neutral-900">Blog / Actualités</h1>
            <p className="text-sm text-neutral-500 mt-1">
              {published} publié{published > 1 ? 's' : ''} · {draft} brouillon{draft > 1 ? 's' : ''}
            </p>
          </div>
          <Link
            href="/admin/blog/new"
            className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold px-4 py-2 rounded-lg transition-colors text-sm"
          >
            + Nouvel article
          </Link>
        </div>

        {posts.length === 0 ? (
          <div className="bg-white rounded-xl border border-neutral-200 p-16 text-center text-neutral-400">
            <p className="text-lg mb-4">Aucun article pour le moment.</p>
            <Link href="/admin/blog/new" className="text-amber-600 hover:underline text-sm">
              Créer le premier article →
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-neutral-50 border-b border-neutral-200">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-neutral-700">Titre</th>
                  <th className="px-4 py-3 text-left font-semibold text-neutral-700 hidden sm:table-cell">Catégorie</th>
                  <th className="px-4 py-3 text-left font-semibold text-neutral-700 hidden md:table-cell">Statut</th>
                  <th className="px-4 py-3 text-left font-semibold text-neutral-700 hidden lg:table-cell">Date</th>
                  <th className="px-4 py-3 text-right font-semibold text-neutral-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {posts.map((post) => {
                  const colorClass = BLOG_CATEGORY_COLORS[post.category as BlogCategory] ?? 'bg-neutral-100 text-neutral-700';
                  const label = BLOG_CATEGORIES[post.category as BlogCategory] ?? post.category;
                  const busy = actionLoading === post.id;

                  return (
                    <tr key={post.id} className="hover:bg-neutral-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-medium text-neutral-900 line-clamp-1">{post.title}</div>
                        <div className="text-xs text-neutral-400">/blog/{post.slug}</div>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${colorClass}`}>
                          {label}
                        </span>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        {post.status === 'published' ? (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                            Publié
                          </span>
                        ) : (
                          <span className="text-xs font-medium text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded-full">
                            Brouillon
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-neutral-400 hidden lg:table-cell">
                        {formatDate(post.created_at)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/admin/blog/${post.id}/edit`}
                            className="text-xs text-neutral-600 hover:text-neutral-900 border border-neutral-200 hover:border-neutral-400 px-2 py-1 rounded transition-colors"
                          >
                            Modifier
                          </Link>
                          <button
                            onClick={() => toggleStatus(post)}
                            disabled={busy}
                            className={`text-xs px-2 py-1 rounded transition-colors border ${
                              post.status === 'published'
                                ? 'text-amber-700 border-amber-200 hover:bg-amber-50'
                                : 'text-green-700 border-green-200 hover:bg-green-50'
                            } disabled:opacity-50`}
                          >
                            {post.status === 'published' ? 'Dépublier' : 'Publier'}
                          </button>
                          <button
                            onClick={() => deletePost(post)}
                            disabled={busy}
                            className="text-xs text-red-600 hover:text-red-800 border border-red-200 hover:border-red-400 px-2 py-1 rounded transition-colors disabled:opacity-50"
                          >
                            Supprimer
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
