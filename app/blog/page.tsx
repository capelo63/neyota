import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { BLOG_CATEGORIES, BLOG_CATEGORY_COLORS, BlogCategory, BlogPost } from '@/lib/constants/blog';

type Props = {
  searchParams: Promise<{ category?: string }>;
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function PostCard({ post }: { post: BlogPost }) {
  const colorClass = BLOG_CATEGORY_COLORS[post.category] ?? 'bg-neutral-100 text-neutral-700';
  const label = BLOG_CATEGORIES[post.category] ?? post.category;

  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group block bg-white rounded-xl overflow-hidden border border-neutral-200 hover:border-amber-300 hover:shadow-md transition-all"
    >
      {post.cover_image_url ? (
        <div className="aspect-video overflow-hidden flex items-center justify-center" style={{ background: '#FFF8F0' }}>
          <img
            src={post.cover_image_url}
            alt={post.title}
            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      ) : (
        <div className="aspect-video bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center">
          <span className="text-4xl">✍️</span>
        </div>
      )}
      <div className="p-5">
        <div className="flex items-center gap-2 mb-3">
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${colorClass}`}>
            {label}
          </span>
          {post.published_at && (
            <span className="text-xs text-neutral-400">{formatDate(post.published_at)}</span>
          )}
        </div>
        <h2 className="text-base font-bold text-neutral-900 group-hover:text-amber-700 transition-colors line-clamp-2 mb-2">
          {post.title}
        </h2>
        {post.excerpt && (
          <p className="text-sm text-neutral-600 line-clamp-3">{post.excerpt}</p>
        )}
      </div>
    </Link>
  );
}

export default async function BlogPage({ searchParams }: Props) {
  const { category } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from('blog_posts')
    .select('*')
    .eq('status', 'published')
    .order('published_at', { ascending: false });

  if (category && Object.keys(BLOG_CATEGORIES).includes(category)) {
    query = query.eq('category', category);
  }

  const { data: posts } = await query;
  const allPosts = (posts ?? []) as BlogPost[];

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navigation />
      <main className="max-w-6xl mx-auto px-4 py-12">
        {/* En-tête */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">Actualités</h1>
          <p className="text-neutral-600">Découvrez les initiatives, témoignages et ressources de Teriis.</p>
        </div>

        {/* Filtres par catégorie */}
        <div className="flex flex-wrap gap-2 mb-8">
          <Link
            href="/blog"
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              !category
                ? 'bg-amber-500 text-white'
                : 'bg-white text-neutral-600 border border-neutral-200 hover:border-amber-300'
            }`}
          >
            Tout voir
          </Link>
          {(Object.entries(BLOG_CATEGORIES) as [BlogCategory, string][]).map(([key, label]) => (
            <Link
              key={key}
              href={`/blog?category=${key}`}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                category === key
                  ? 'bg-amber-500 text-white'
                  : 'bg-white text-neutral-600 border border-neutral-200 hover:border-amber-300'
              }`}
            >
              {label}
            </Link>
          ))}
        </div>

        {/* Grille d'articles */}
        {allPosts.length === 0 ? (
          <div className="text-center py-24 text-neutral-400">
            <p className="text-lg">Aucun article pour le moment.</p>
            <p className="text-sm mt-2">Revenez bientôt !</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {allPosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
