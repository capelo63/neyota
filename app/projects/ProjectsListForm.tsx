'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import Link from 'next/link';
import { Button, Input, Select, Badge } from '@/components/ui';

interface Project {
  id: string;
  title: string;
  short_pitch: string;
  current_phase: string;
  city: string;
  postal_code: string;
  is_remote_possible: boolean;
  created_at: string;
  owner: {
    first_name: string;
    last_name: string;
  };
  skills: Array<{
    id: number;
    name: string;
  }>;
}

const PHASE_LABELS: Record<string, string> = {
  ideation: '💡 Idéation',
  mvp_development: '🛠️ Développement MVP',
  launch: '🚀 Lancement',
  growth: '📈 Croissance',
  scaling: '🌍 Structuration',
};

const PHASE_COLORS: Record<string, 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info'> = {
  ideation: 'info',
  mvp_development: 'warning',
  launch: 'success',
  growth: 'primary',
  scaling: 'secondary',
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
  const [skills, setSkills] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPhase, setSelectedPhase] = useState('all');
  const [selectedSkill, setSelectedSkill] = useState('all');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchQuery, selectedPhase, selectedSkill, projects]);

  const loadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
        return;
      }

      setUser(user);

      // Load profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (!profileData) {
        router.push('/login');
        return;
      }

      setProfile(profileData);

      // Load projects with owner and skills
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select(`
          *,
          owner:owner_id(first_name, last_name),
          skills:project_skills_needed(
            skill:skills(id, name)
          )
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (projectsError) {
        console.error('Error loading projects:', projectsError);
      } else {
        // Transform the data to flatten skills and handle missing owners
        const transformedProjects = (projectsData || [])
          .map((project: any) => {
            // Handle owner array (Supabase can return arrays for foreign keys)
            const owner = Array.isArray(project.owner)
              ? (project.owner.length > 0 ? project.owner[0] : null)
              : project.owner;

            return {
              ...project,
              owner,
              skills: project.skills.map((s: any) => s.skill).filter((s: any) => s !== null),
            };
          })
          .filter((project: any) => project.owner !== null);

        setProjects(transformedProjects);
        setFilteredProjects(transformedProjects);
      }

      // Load skills for filter
      const { data: skillsData } = await supabase
        .from('skills')
        .select('*')
        .order('name');

      setSkills(skillsData || []);
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

    // Skill filter
    if (selectedSkill !== 'all') {
      filtered = filtered.filter(project =>
        project.skills.some(skill => skill.id === parseInt(selectedSkill))
      );
    }

    setFilteredProjects(filtered);
  };

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedPhase('all');
    setSelectedSkill('all');
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
      {/* Header */}
      <header className="bg-white border-b border-neutral-200 py-4 px-4">
        <div className="container-custom">
          <div className="flex items-center justify-between">
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">N</span>
              </div>
              <span className="text-2xl font-bold text-neutral-900">NEYOTA</span>
            </Link>
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                ← Retour au dashboard
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container-custom py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-neutral-900 mb-2">
            Projets disponibles
          </h1>
          <p className="text-neutral-600">
            Découvrez les projets entrepreneuriaux de votre territoire et proposez vos compétences
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <aside className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-4">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-neutral-900">Filtres</h2>
                {(searchQuery || selectedPhase !== 'all' || selectedSkill !== 'all') && (
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
                    { value: 'mvp_development', label: '🛠️ Développement MVP' },
                    { value: 'launch', label: '🚀 Lancement' },
                    { value: 'growth', label: '📈 Croissance' },
                    { value: 'scaling', label: '🌍 Structuration' },
                  ]}
                />

                <Select
                  label="Compétence"
                  value={selectedSkill}
                  onChange={(e) => setSelectedSkill(e.target.value)}
                  options={[
                    { value: 'all', label: 'Toutes les compétences' },
                    ...skills.map(skill => ({
                      value: skill.id.toString(),
                      label: skill.name,
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

                      {/* Skills */}
                      {project.skills.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {project.skills.slice(0, 5).map((skill) => (
                            <Badge key={skill.id} variant="secondary">
                              {skill.name}
                            </Badge>
                          ))}
                          {project.skills.length > 5 && (
                            <Badge variant="secondary">
                              +{project.skills.length - 5} autres
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
    </div>
  );
}
