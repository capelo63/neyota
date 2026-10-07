import { MetadataRoute } from 'next';
import { createClient } from '@supabase/supabase-js';

// Regénéré au plus toutes les heures (sinon figé au build)
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.teriis.fr';

  // Initialize Supabase client (server-side)
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Fetch all active projects for sitemap
  const { data: projects, error: projectsError } = await supabase
    .from('projects_public')
    .select('id, updated_at')
    .eq('status', 'active')
    .order('updated_at', { ascending: false });

  if (projectsError) {
    console.error('[SITEMAP] Error fetching projects:', projectsError.message);
  }

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/projects`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/signup`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
  ];

  // Dynamic project pages
  const projectPages: MetadataRoute.Sitemap = (projects || []).map((project) => ({
    url: `${baseUrl}/projects/${project.id}`,
    lastModified: new Date(project.updated_at),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  return [...staticPages, ...projectPages];
}
