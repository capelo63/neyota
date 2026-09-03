import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { BLOG_CATEGORIES, BLOG_CATEGORY_COLORS, BlogCategory, BlogPost } from '@/lib/constants/blog';

type Props = {
  params: Promise<{ slug: string }>;
};

async function getPost(slug: string): Promise<BlogPost | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .single();
  return (data as BlogPost | null);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return { title: 'Article introuvable — Teriis' };
  return {
    title: `${post.title} — Teriis`,
    description: post.excerpt ?? undefined,
    openGraph: post.cover_image_url
      ? { images: [{ url: post.cover_image_url }] }
      : undefined,
  };
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) notFound();

  const colorClass = BLOG_CATEGORY_COLORS[post.category as BlogCategory] ?? 'bg-neutral-100 text-neutral-700';
  const label = BLOG_CATEGORIES[post.category as BlogCategory] ?? post.category;

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navigation />
      <main>
        {/* Image de couverture */}
        {post.cover_image_url && (
          <div className="w-full overflow-hidden flex items-center justify-center" style={{ background: '#FFF8F0', maxHeight: '420px' }}>
            <img
              src={post.cover_image_url}
              alt={post.title}
              className="w-full object-contain"
              style={{ maxHeight: '420px' }}
            />
          </div>
        )}

        <div className="max-w-3xl mx-auto px-4 py-12">
          {/* Breadcrumb */}
          <div className="mb-6 text-sm text-neutral-500">
            <Link href="/blog" className="hover:text-amber-600 transition-colors">
              Actualités
            </Link>
            <span className="mx-2">›</span>
            <span>{post.title}</span>
          </div>

          {/* Header */}
          <header className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <span className={`text-xs font-medium px-3 py-1 rounded-full ${colorClass}`}>
                {label}
              </span>
              {post.published_at && (
                <span className="text-sm text-neutral-400">{formatDate(post.published_at)}</span>
              )}
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-neutral-900 leading-tight mb-4">
              {post.title}
            </h1>
            {post.excerpt && (
              <p className="text-lg text-neutral-600 leading-relaxed">{post.excerpt}</p>
            )}
          </header>

          {/* Contenu */}
          <style>{`
            .blog-content h2 { font-size: 1.5rem; font-weight: 700; margin: 2rem 0 0.75rem; color: #171717; }
            .blog-content h3 { font-size: 1.25rem; font-weight: 600; margin: 1.5rem 0 0.5rem; color: #171717; }
            .blog-content p { margin: 0.75rem 0; color: #404040; line-height: 1.75; }
            .blog-content ul { list-style: disc; padding-left: 1.5rem; margin: 0.75rem 0; color: #404040; }
            .blog-content ol { list-style: decimal; padding-left: 1.5rem; margin: 0.75rem 0; color: #404040; }
            .blog-content li { margin: 0.25rem 0; }
            .blog-content blockquote { border-left: 4px solid #f59e0b; padding-left: 1.25rem; color: #6b7280; font-style: italic; margin: 1.5rem 0; }
            .blog-content a { color: #d97706; text-decoration: underline; }
            .blog-content a:hover { color: #b45309; }
            .blog-content strong { font-weight: 700; color: #171717; }
            .blog-content em { font-style: italic; }
            .blog-content code { background: #f3f4f6; padding: 0.1em 0.4em; border-radius: 3px; font-family: monospace; font-size: 0.9em; }
          `}</style>
          <article
            className="blog-content text-base"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* Retour */}
          <div className="mt-12 pt-8 border-t border-neutral-200">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-amber-600 transition-colors"
            >
              ← Retour aux actualités
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
