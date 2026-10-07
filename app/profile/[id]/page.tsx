import { Suspense } from 'react';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import ProfileView from './ProfileView';
import PartnerProfileView from './PartnerProfileView';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import LoginRequired from '@/components/LoginRequired';

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Visiteur non connecté : aucune lecture de profil (ni client admin, ni profiles, ni user_skills)
  const authClient = await createClient();
  const { data: { user: viewer } } = await authClient.auth.getUser();

  if (!viewer) {
    return (
      <div className="min-h-screen bg-neutral-50 flex flex-col">
        <Navigation />
        <main className="flex-1 container-custom py-16 px-4">
          <LoginRequired
            title="Connectez-vous pour consulter les talents"
            description="Les profils sont réservés aux membres connectés de Teriis."
            redirectPath={`/profile/${id}`}
          />
        </main>
        <Footer />
      </div>
    );
  }

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from('profiles')
    .select('id, role, first_name, last_name')
    .eq('id', id)
    .single();

  if (profile?.role === 'partner') {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const { data: org } = await admin
      .from('partner_organizations')
      .select('organization_name, organization_type, organization_subtype, siret, territory_scope, territory_codes, intervention_categories, is_validated')
      .eq('user_id', id)
      .single();

    return (
      <PartnerProfileView
        profileId={id}
        firstName={profile.first_name ?? ''}
        lastName={profile.last_name ?? ''}
        isOwnProfile={user?.id === id}
        org={org}
      />
    );
  }

  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-gray-600">Chargement du profil...</div>
        </div>
      }
    >
      <ProfileView userId={id} />
    </Suspense>
  );
}
