'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import Link from 'next/link';
import { Button, Input, Select, Badge } from '@/components/ui';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { FRENCH_REGIONS, getRegionSlugFromPostal } from '@/lib/constants/regions';

interface Project {
  id: string;
  title: string;
  short_pitch: string;
  current_phase: string;
  city: string;
  postal_code: string;
  region: string | null;
  is_remote_possible: boolean;
  created_at: string;
  owner: {
    first_name: string;
    last_name: string;
  };
  needs: Array<{
    id: string;
    name: string;
    category: string;
  }>;
  categories: Array<{
    category: string;
  }>;
}

const PHASE_LABELS: Record<string, string> = {
  ideation: '💡 Idéation',
  mvp_development: '🛠️ En construction',
  launch: '🚀 Lancement',
  growth: '📈 Développement',
  scaling: '🌍 Structuration',
};

const PHASE_COLORS: Record<string, 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info'> = {
  ideation: 'info',
  mvp_development: 'warning',
  launch: 'success',
  growth: 'primary',
  scaling: 'secondary',
};

const CATEGORY_LABELS: Record<string, string> = {
  agriculture: '🌾 Agriculture / Alimentation',
  culture: '🎨 Culture / Tourisme / Sport',
  education: '🎓 Éducation',
  environment: '🌱 Environnement / Transition',
  mobility: '🚗 Mobilité / Énergie / Construction',
  health: '🏥 Santé / Bien-être',
  social: '🤝 Social / Associatif',
};

export default function ProjectsListForm() {
  const router = useRouter();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [needs, setNeeds] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPhase, setSelectedPhase] = useState('all');
  const [selectedNeed, setSelectedNeed] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedRegion, setSelectedRegion] = useState('all');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchQuery, selectedPhase, selectedNeed, selectedCategory, selectedRegion, projects]);

  const loadData = async () => {
    try {
      // Try to load user (optional - page is public)
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        setUser(user);

        // Load profile if user is logged in
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileData) {
          setProfile(profileData);
        }
      }

      // Load projects with owner, needs, and categories
      // Only select fields needed for list view — full_description and phase_objectives
      // are intentionally excluded to avoid exposing sensitive project details publicly
      const { data: projectsData, error: projectsError} = await supabase
        .from('projects')
        .select(`
          id,
          title,
          short_pitch,
          current_phase,
          city,
          postal_code,
          region,
          is_remote_possible,
          created_at,
          owner_id,
          owner:owner_id(first_name, last_name),
          needs:project_needs(
            need:needs(id, name, category)
          ),
          categories:project_categories(category)
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (projectsError) {
        console.error('Error loading projects:', projectsError);
      } else {
        // Transform the data to flatten needs and handle missing owners
        const transformedProjects = (projectsData || [])
          .map((project: any) => {
            // Handle owner array (Supabase can return arrays for foreign keys)
            const owner = Array.isArray(project.owner)
              ? (project.owner.length > 0 ? project.owner[0] : null)
              : project.owner;

            return {
              ...project,
              owner,
              needs: project.needs.map((n: any) => n.need).filter((n: any) => n !== null),
              categories: project.categories || [],
            };
          })
          .filter((project: any) => project.owner !== null);

        setProjects(transformedProjects);
        setFilteredProjects(transformedProjects);
      }

      // Load needs for filter
      const { data: needsData } = await supabase
        .from('needs')
        .select('*')
        .order('name');

      setNeeds(needsData || []);
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading data:', error);
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...projects];

    // Search query
    if (searchQuery) {
      filtered = filtered.filter(project =>
        project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.short_pitch.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.city.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Phase filter
    if (selectedPhase !== 'all') {
      filtered = filtered.filter(project => project.current_phase === selectedPhase);
    }

    // Need filter
    if (selectedNeed !== 'all') {
      filtered = filtered.filter(project =>
        project.needs.some(need => need.id === selectedNeed)
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(project =>
        project.categories.some(cat => cat.category === selectedCategory)
      );
    }

    // Region filter — compare slugs only (no accent/apostrophe issues)
    // postal_code is always present and reliable; stored region field may be null/inconsistent
    if (selectedRegion !== 'all') {
      filtered = filtered.filter(project =>
        getRegionSlugFromPostal(project.postal_code) === selectedRegion
      );
    }

    setFilteredProjects(filtered);
  };

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedPhase('all');
    setSelectedNeed('all');
    setSelectedCategory('all');
    setSelectedRegion('all');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-neutral-600">Chargement des projets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      <Navigation />

      {/* Main Content */}
      <main className="flex-1 container-custom py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-neutral-900 mb-2">
            Projets disponibles
          </h1>
          <p className="text-neutral-600">
            Découvrez les projets d'initiative de votre territoire et proposez vos compétences.<br />
            Teriis facilite la rencontre entre porteurs de projet et talents et permet de mobiliser des personnes éloignées des opportunités pour faire émerger des initiatives utiles, près de chez vous.
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <aside className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-4">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-neutral-900">Filtres</h2>
                {(searchQuery || selectedPhase !== 'all' || selectedNeed !== 'all' || selectedCategory !== 'all' || selectedRegion !== 'all') && (
                  <button
                    onClick={resetFilters}
                    className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                  >
                    Réinitialiser
                  </button>
                )}
              </div>

              <div className="space-y-5">
                <Input
                  type="text"
                  placeholder="Rechercher..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />

                <Select
                  label="Phase"
                  value={selectedPhase}
                  onChange={(e) => setSelectedPhase(e.target.value)}
                  options={[
                    { value: 'all', label: 'Toutes les phases' },
                    { value: 'ideation', label: '💡 Idéation' },
                    { value: 'mvp_development', label: '🛠️ En construction' },
                    { value: 'launch', label: '🚀 Lancement' },
                    { value: 'growth', label: '📈 Développement' },
                    { value: 'scaling', label: '🌍 Structuration' },
                  ]}
                />

                <Select
                  label="Besoins"
                  value={selectedNeed}
                  onChange={(e) => setSelectedNeed(e.target.value)}
                  options={[
                    { value: 'all', label: 'Tous les besoins' },
                    ...needs.map(need => ({
                      value: need.id.toString(),
                      label: need.name,
                    })),
                  ]}
                />

                <Select
                  label="Secteurs d'activité"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  options={[
                    { value: 'all', label: 'Tous les secteurs' },
                    ...Object.entries(CATEGORY_LABELS).map(([value, label]) => ({
                      value,
                      label,
                    })),
                  ]}
                />

                <Select
                  label="Région"
                  value={selectedRegion}
                  onChange={(e) => setSelectedRegion(e.target.value)}
                  options={[
                    { value: 'all', label: 'Toutes les régions' },
                    ...FRENCH_REGIONS.map((region) => ({
                      value: region.value,
                      label: region.label,
                    })),
                  ]}
                />
              </div>

              <div className="mt-6 pt-6 border-t border-neutral-200">
                <p className="text-sm text-neutral-600">
                  <strong>{filteredProjects.length}</strong> projet(s) trouvé(s)
                </p>
              </div>
            </div>
          </aside>

          {/* Projects List */}
          <div className="lg:col-span-3">
            {filteredProjects.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-neutral-900 mb-2">
                  Aucun projet trouvé
                </h3>
                <p className="text-neutral-600 mb-6">
                  Essayez de modifier vos filtres pour voir plus de projets
                </p>
                <Button variant="secondary" onClick={resetFilters}>
                  Réinitialiser les filtres
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                {filteredProjects.map((project) => (
                  <Link key={project.id} href={`/projects/${project.id}`}>
                    <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer border border-neutral-200 hover:border-primary-500">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-neutral-900 mb-2">
                            {project.title}
                          </h3>
                          <div className="flex items-center gap-3 text-sm text-neutral-600">
                            <span className="flex items-center gap-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                              {project.owner.first_name} {project.owner.last_name}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              {project.city}
                            </span>
                            {project.is_remote_possible && (
                              <>
                                <span>•</span>
                                <span className="text-primary-600 font-medium">Distanciel possible</span>
                              </>
                            )}
                          </div>
                        </div>
                        <Badge variant={PHASE_COLORS[project.current_phase]}>
                          {PHASE_LABELS[project.current_phase]}
                        </Badge>
                      </div>

                      {/* Pitch */}
                      <p className="text-neutral-700 mb-4 line-clamp-3">
                        {project.short_pitch}
                      </p>

                      {/* Needs */}
                      {project.needs.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {project.needs.slice(0, 5).map((need) => (
                            <Badge key={need.id} variant="secondary">
                              {need.name}
                            </Badge>
                          ))}
                          {project.needs.length > 5 && (
                            <Badge variant="secondary">
                              +{project.needs.length - 5} autres
                            </Badge>
                          )}
                        </div>
                      )}

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-4 border-t border-neutral-200">
                        <span className="text-sm text-neutral-500">
                          Publié le {new Date(project.created_at).toLocaleDateString('fr-FR')}
                        </span>
                        <span className="text-primary-600 font-medium flex items-center gap-1">
                          Voir le projet
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
