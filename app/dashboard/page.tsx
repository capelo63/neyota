'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import Link from 'next/link';
import { Button } from '@/components/ui';
import { NotificationBell } from '@/components/notifications/NotificationBell';

export default function DashboardPage() {
  const router = useRouter();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUserData = async () => {
      console.log('[DASHBOARD] Loading user data...');
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        console.log('[DASHBOARD] No user found, redirecting to login');
        router.push('/login');
        return;
      }

      console.log('[DASHBOARD] User found:', user.id);
      setUser(user);

      // Load profile
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      console.log('[DASHBOARD] Profile loaded:', {
        profile,
        error,
        first_name: profile?.first_name,
        last_name: profile?.last_name,
        postal_code: profile?.postal_code,
        city: profile?.city
      });

      // If profile doesn't exist or is incomplete, redirect to onboarding
      const isIncomplete = !profile || !profile.first_name || !profile.last_name || !profile.postal_code || profile.postal_code === '00000' || profile.city === 'À définir';

      console.log('[DASHBOARD] Profile check:', {
        exists: !!profile,
        has_first_name: !!profile?.first_name,
        has_last_name: !!profile?.last_name,
        has_postal_code: !!profile?.postal_code,
        postal_code_value: profile?.postal_code,
        city_value: profile?.city,
        isIncomplete
      });

      if (isIncomplete) {
        console.log('[DASHBOARD] Profile incomplete, redirecting to onboarding');
        router.push('/onboarding');
        return;
      }

      console.log('[DASHBOARD] Profile complete, showing dashboard');
      setProfile(profile);

      // Load projects if entrepreneur
      if (profile.role === 'entrepreneur') {
        const { data: projectsData, error: projectsError } = await supabase
          .from('projects')
          .select('*')
          .eq('owner_id', user.id)
          .order('created_at', { ascending: false });

        if (!projectsError && projectsData) {
          console.log('[DASHBOARD] Projects loaded:', projectsData.length);
          setProjects(projectsData);
        }
      }

      setIsLoading(false);
    };

    loadUserData();
  }, [router, supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-neutral-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200 py-4 px-4">
        <div className="container-custom">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">N</span>
              </div>
              <span className="text-2xl font-bold text-neutral-900">NEYOTA</span>
            </Link>
            <div className="flex items-center gap-3">
              <NotificationBell />
              {profile?.id && (
                <Link href={`/profile/${profile.id}`}>
                  <Button variant="ghost" size="sm">
                    Mon profil
                  </Button>
                </Link>
              )}
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                Déconnexion
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container-custom py-12">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm p-8 mb-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-3xl">
                  {profile?.first_name?.[0]?.toUpperCase() || 'U'}
                </span>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-neutral-900">
                  Bienvenue, {profile?.first_name || 'utilisateur'} !
                </h1>
                <p className="text-neutral-600">
                  {profile?.role === 'entrepreneur' ? '💼 Entrepreneur' : '🌟 Talent'}
                </p>
              </div>
            </div>

            <div className="space-y-4 text-neutral-700">
              <div>
                <strong>Email:</strong> {user?.email}
              </div>
              <div>
                <strong>Nom:</strong> {profile?.first_name} {profile?.last_name}
              </div>
              <div>
                <strong>Rôle:</strong> {profile?.role}
              </div>
              <div>
                <strong>Membre depuis:</strong> {new Date(user?.created_at).toLocaleDateString('fr-FR')}
              </div>
            </div>
          </div>

          {/* Entrepreneur Actions */}
          {profile?.role === 'entrepreneur' && (
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-neutral-900">
                  Mes projets {projects.length > 0 && `(${projects.length})`}
                </h2>
                <Link href="/projects/new">
                  <Button variant="primary">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Créer un projet
                  </Button>
                </Link>
              </div>

              {projects.length === 0 ? (
                <p className="text-neutral-600">
                  Vous n&apos;avez pas encore créé de projet. Créez votre premier projet pour trouver des talents locaux qui vous aideront à le concrétiser !
                </p>
              ) : (
                <div className="space-y-4">
                  {projects.map((project) => (
                    <div
                      key={project.id}
                      className="border border-neutral-200 rounded-lg p-4 hover:border-primary-300 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-neutral-900 mb-1">
                            {project.title}
                          </h3>
                          <p className="text-sm text-neutral-600 mb-2">
                            {project.short_pitch}
                          </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          project.status === 'active'
                            ? 'bg-success-100 text-success-700'
                            : 'bg-neutral-100 text-neutral-700'
                        }`}>
                          {project.status === 'active' ? 'Actif' : 'Inactif'}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-neutral-500 mb-3">
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {project.city}
                        </span>
                        <span className="flex items-center gap-1">
                          📊 Phase: {project.current_phase}
                        </span>
                        <span className="flex items-center gap-1">
                          📅 {new Date(project.created_at).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <Link href={`/projects/${project.id}`}>
                          <Button variant="secondary" size="sm">
                            Voir les détails
                          </Button>
                        </Link>
                        <Link href={`/projects/${project.id}/applications`}>
                          <Button variant="ghost" size="sm">
                            📨 Candidatures
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Talent Actions */}
          {profile?.role === 'talent' && (
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-neutral-900">Projets disponibles</h2>
                <div className="flex gap-3">
                  <Link href="/matching">
                    <Button variant="primary">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                      </svg>
                      Projets suggérés
                    </Button>
                  </Link>
                  <Link href="/projects">
                    <Button variant="secondary">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      Tous les projets
                    </Button>
                  </Link>
                </div>
              </div>
              <p className="text-neutral-600">
                Découvrez les projets correspondant à vos compétences et votre localisation, ou parcourez tous les projets disponibles.
              </p>
            </div>
          )}

          <div className="bg-primary-50 border border-primary-200 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-neutral-900 mb-4">
              🚧 Fonctionnalités à venir
            </h2>
            <ul className="list-disc list-inside space-y-2 text-neutral-700">
              <li>Messagerie entre entrepreneurs et talents</li>
              <li>Filtres avancés et recherche territoriale</li>
              <li>Tableau de bord analytique pour les entrepreneurs</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
