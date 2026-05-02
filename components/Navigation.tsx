'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import { Button } from '@/components/ui';
import { NotificationBell } from '@/components/notifications/NotificationBell';

export default function Navigation() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<'talent' | 'entrepreneur' | 'partner' | null>(null);
  const [profileId, setProfileId] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const isPartnerPage = pathname.startsWith('/partenaires');

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setIsAuthenticated(!!user);

      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('id, role')
          .eq('id', user.id)
          .single();

        if (profile) {
          setUserRole(profile.role);
          setProfileId(profile.id);
        }
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
      if (!session) {
        setUserRole(null);
        setProfileId(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setIsAuthenticated(false);
    setUserRole(null);
    setProfileId(null);
    router.push('/');
    router.refresh();
  };

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-neutral-200 shadow-sm">
      <div className="container-custom">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">T</span>
            </div>
            <span className="text-2xl font-bold text-neutral-900">Teriis</span>
          </Link>

          {/* Desktop — liens publics */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/projects" className="text-neutral-700 hover:text-primary-600 font-medium transition-colors">
              Projets
            </Link>
            <Link href="/talents" className="text-neutral-700 hover:text-primary-600 font-medium transition-colors">
              Talents
            </Link>
            <Link href="/about" className="text-neutral-700 hover:text-primary-600 font-medium transition-colors">
              À propos
            </Link>
          </div>

          {/* Desktop — actions utilisateur */}
          <div className="hidden md:flex items-center gap-2">
            {isAuthenticated ? (
              <>
                <NotificationBell />
                {profileId && (
                  <Link href={`/profile/${profileId}`}>
                    <Button variant="ghost" size="sm">Mon profil</Button>
                  </Link>
                )}
                <Link href={userRole === 'partner' ? '/partenaires/dashboard' : '/dashboard'}>
                  <Button variant="ghost" size="sm">
                    {userRole === 'partner' ? 'Espace partenaire' : 'Tableau de bord'}
                  </Button>
                </Link>
                {userRole !== 'partner' && (
                  <Link href="/settings">
                    <Button variant="ghost" size="sm">Paramètres</Button>
                  </Link>
                )}
                <Button variant="ghost" size="sm" onClick={handleSignOut}>
                  Déconnexion
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm">Connexion</Button>
                </Link>
                {!isPartnerPage && (
                  <Link href="/signup">
                    <Button variant="default" size="sm">S&apos;inscrire</Button>
                  </Link>
                )}
              </>
            )}
          </div>

          {/* Mobile — cloche + bouton hamburger */}
          <div className="flex md:hidden items-center gap-1">
            {isAuthenticated && <NotificationBell />}
            <button
              className="p-2 text-neutral-600 hover:text-neutral-900"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
            >
              <svg className="w-6 h-6" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                {isMobileMenuOpen ? (
                  <path d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-neutral-200 animate-fade-in">
            <div className="flex flex-col gap-4">
              <Link href="/projects" className="text-neutral-700 hover:text-primary-600 font-medium py-2" onClick={() => setIsMobileMenuOpen(false)}>
                Projets
              </Link>
              <Link href="/talents" className="text-neutral-700 hover:text-primary-600 font-medium py-2" onClick={() => setIsMobileMenuOpen(false)}>
                Talents
              </Link>
              <Link href="/about" className="text-neutral-700 hover:text-primary-600 font-medium py-2" onClick={() => setIsMobileMenuOpen(false)}>
                À propos
              </Link>
              <div className="flex flex-col gap-2 pt-4 border-t border-neutral-200">
                {isAuthenticated ? (
                  <>
                    {profileId && (
                      <Link href={`/profile/${profileId}`} onClick={() => setIsMobileMenuOpen(false)}>
                        <Button variant="ghost" className="w-full">Mon profil</Button>
                      </Link>
                    )}
                    <Link
                      href={userRole === 'partner' ? '/partenaires/dashboard' : '/dashboard'}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Button variant="ghost" className="w-full">
                        {userRole === 'partner' ? 'Espace partenaire' : 'Tableau de bord'}
                      </Button>
                    </Link>
                    {userRole !== 'partner' && (
                      <Link href="/settings" onClick={() => setIsMobileMenuOpen(false)}>
                        <Button variant="ghost" className="w-full">Paramètres</Button>
                      </Link>
                    )}
                    <Button variant="ghost" className="w-full" onClick={handleSignOut}>
                      Déconnexion
                    </Button>
                  </>
                ) : (
                  <>
                    <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button variant="ghost" className="w-full">Connexion</Button>
                    </Link>
                    {!isPartnerPage && (
                      <Link href="/signup" onClick={() => setIsMobileMenuOpen(false)}>
                        <Button variant="default" className="w-full">S&apos;inscrire</Button>
                      </Link>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
