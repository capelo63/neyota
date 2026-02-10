'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Link from 'next/link';
import { Button } from '@/components/ui';

export default function DashboardPage() {
  const router = useRouter();
  const supabase = createClientComponentClient();
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
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              Déconnexion
            </Button>
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

          <div className="bg-primary-50 border border-primary-200 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-neutral-900 mb-4">
              🚧 Dashboard en construction
            </h2>
            <p className="text-neutral-700 mb-4">
              Votre authentification fonctionne parfaitement ! Les prochaines étapes incluront :
            </p>
            <ul className="list-disc list-inside space-y-2 text-neutral-700">
              <li>Complétion de votre profil (localisation, compétences, bio)</li>
              <li>Navigation entre projets et talents</li>
              <li>Création de projets (pour entrepreneurs)</li>
              <li>Système de matching intelligent</li>
              <li>Messagerie et notifications</li>
              <li>Tableau de bord avec statistiques</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
