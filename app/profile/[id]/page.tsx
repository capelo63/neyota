import { Suspense } from 'react';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import ProfileView from './ProfileView';
import PartnerProfileView from './PartnerProfileView';

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

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
