'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import Link from 'next/link';
import { Button, Badge } from '@/components/ui';

const PHASE_LABELS: Record<string, string> = {
  ideation: '💡 Idéation',
  mvp_development: '🛠️ En construction',
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

export default function MatchingProjectsForm() {
  const router = useRouter();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [matchingProjects, setMatchingProjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

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

      if (!profileData || profileData.role !== 'talent') {
        router.push('/dashboard');
        return;
      }

      setProfile(profileData);

      // Check if profile has required data for matching
      if (!profileData.latitude || !profileData.longitude) {
        setError('Votre profil ne contient pas de coordonnées géographiques. Veuillez compléter votre localisation dans les paramètres.');
        setIsLoading(false);
        return;
      }

      // Check if talent has skills
      const { data: skillsData } = await supabase
        .from('user_skills')
        .select('skill_id')
        .eq('user_id', user.id);

      if (!skillsData || skillsData.length === 0) {
        setError('Vous n\'avez pas encore ajouté de compétences à votre profil. Veuillez ajouter vos compétences pour voir les projets qui vous correspondent.');
        setIsLoading(false);
        return;
      }

      // Load matching projects via RPC
      const { data: matchingData, error: matchingError } = await supabase.rpc('find_matching_projects', {
        talent_user_id: user.id,
        max_results: 20,
      });

      if (matchingError) {
        console.error('Matching error:', matchingError);
        setError(`Erreur lors de la recherche de projets : ${matchingError.message}`);
      } else {
        setMatchingProjects(matchingData || []);
      }

      setIsLoading(false);
    } catch (error) {
      console.error('Error loading data:', error);
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-neutral-600">Recherche de projets adaptés...</p>
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
                <span className="text-white font-bold text-xl">T</span>
              </div>
              <span className="text-2xl font-bold text-neutral-900">TERRII</span>
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
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="text-5xl">🎯</div>
              <div>
                <h1 className="text-4xl font-bold text-neutral-900 mb-2">
                  Projets suggérés pour vous
                </h1>
                <p className="text-neutral-600">
                  Basés sur vos compétences et votre localisation
                </p>
              </div>
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-primary-50 border border-primary-200 rounded-xl p-6 mb-8">
            <h2 className="font-semibold text-neutral-900 mb-2">
              🧮 Comment fonctionne le matching ?
            </h2>
            <ul className="text-sm text-neutral-700 space-y-1">
              <li>• <strong>Compétences</strong> : Projets correspondant à vos compétences (60%)</li>
              <li>• <strong>Proximité</strong> : Projets proches de vous pour favoriser le local (40%)</li>
              <li>• <strong>Filtres automatiques</strong> : Dans votre rayon de recherche ou en distanciel</li>
            </ul>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-error-50 border border-error-200 rounded-xl p-6 mb-8">
              <div className="flex items-start gap-3">
                <div className="text-3xl">⚠️</div>
                <div className="flex-1">
                  <h3 className="font-semibold text-error-900 mb-2">
                    Impossible de charger les projets suggérés
                  </h3>
                  <p className="text-error-700 mb-4">{error}</p>
                  <Link href="/dashboard">
                    <Button variant="primary" size="sm">
                      Retour au dashboard
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Projects List */}
          {!error && matchingProjects.length === 0 && (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-neutral-900 mb-2">
                Aucun projet trouvé pour le moment
              </h3>
              <p className="text-neutral-700 mb-6">
                Nous n'avons pas trouvé de projets correspondant à vos compétences et votre localisation.
              </p>
              <div className="space-y-2 text-neutral-600 text-sm mb-6">
                <p>Pour améliorer vos suggestions :</p>
                <ul className="list-disc list-inside">
                  <li>Ajoutez plus de compétences à votre profil</li>
                  <li>Augmentez votre rayon de recherche</li>
                  <li>Consultez tous les projets disponibles</li>
                </ul>
              </div>
              <Link href="/projects">
                <Button variant="primary">
                  Voir tous les projets
                </Button>
              </Link>
            </div>
          )}

          {!error && matchingProjects.length > 0 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-4">
                <p className="text-neutral-600">
                  <strong>{matchingProjects.length}</strong> projet(s) trouvé(s)
                </p>
                <Link href="/projects">
                  <Button variant="ghost" size="sm">
                    Voir tous les projets →
                  </Button>
                </Link>
              </div>

              {matchingProjects.map((project) => (
                <Link key={project.project_id} href={`/projects/${project.project_id}`}>
                  <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer border border-neutral-200 hover:border-primary-500">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <Badge variant={PHASE_COLORS[project.project_phase]}>
                            {PHASE_LABELS[project.project_phase]}
                          </Badge>
                          {project.distance_km !== null && (
                            <Badge variant="secondary">
                              📍 {project.distance_km} km
                            </Badge>
                          )}
                          <Badge variant="success">
                            ✓ {project.skills_match_count} compétence(s) matchées
                          </Badge>
                        </div>
                        <h3 className="text-xl font-semibold text-neutral-900 mb-2">
                          {project.project_title}
                        </h3>
                        <div className="flex items-center gap-3 text-sm text-neutral-600">
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            {project.owner_name}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            {project.project_city}
                          </span>
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-primary-600">
                          {Math.round(project.relevance_score * 100)}%
                        </div>
                        <div className="text-xs text-neutral-500">Pertinence</div>
                      </div>
                    </div>

                    {/* Pitch */}
                    <p className="text-neutral-700 mb-4 line-clamp-2">
                      {project.project_pitch}
                    </p>

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
      </main>
    </div>
  );
}
