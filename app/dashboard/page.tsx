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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
        return;
      }

      setUser(user);

      // Load profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      // If profile doesn't exist or is incomplete, redirect to onboarding
      if (!profile || !profile.first_name || !profile.last_name || !profile.postal_code || profile.postal_code === '00000' || profile.city === 'À définir') {
        router.push('/onboarding');
        return;
      }

      setProfile(profile);
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
                <h2 className="text-2xl font-bold text-neutral-900">Mes projets</h2>
                <Link href="/projects/new">
                  <Button variant="primary">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Créer un projet
                  </Button>
                </Link>
              </div>
              <p className="text-neutral-600">
                Créez un projet pour trouver des talents locaux qui vous aideront à le concrétiser.
              </p>
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
