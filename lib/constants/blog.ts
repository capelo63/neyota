export const BLOG_CATEGORIES = {
  actualites: 'Actualités',
  initiatives: 'Initiatives',
  temoignages: 'Témoignages',
  ressources: 'Ressources',
  evenements: 'Événements',
} as const;

export type BlogCategory = keyof typeof BLOG_CATEGORIES;

export const BLOG_CATEGORY_COLORS: Record<BlogCategory, string> = {
  actualites:  'bg-blue-100 text-blue-700',
  initiatives: 'bg-green-100 text-green-700',
  temoignages: 'bg-purple-100 text-purple-700',
  ressources:  'bg-amber-100 text-amber-700',
  evenements:  'bg-red-100 text-red-700',
};

export type BlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  cover_image_url: string | null;
  category: BlogCategory;
  author_id: string | null;
  status: 'draft' | 'published';
  published_at: string | null;
  created_at: string;
  updated_at: string;
};
