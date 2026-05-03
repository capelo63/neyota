import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import Navigation from '@/components/Navigation';
import PartnerValidationsList from './PartnerValidationsList';

type RawOrg = {
  id: string;
  user_id: string;
  organization_name: string;
  siret: string | null;
  organization_type: string;
  organization_subtype: string | null;
  territory_scope: string | null;
  territory_codes: string[] | null;
  justification_url: string | null;
  intervention_categories: string[] | null;
  created_at: string;
};

export type PartnerApplication = RawOrg & {
  contact_email: string;
  contact_first_name: string;
  contact_last_name: string;
};

export default async function PartnerValidationsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single();

  if (!profile?.is_admin) {
    redirect('/dashboard');
  }

  const adminSupabase = createAdminClient();

  const { data: orgs } = await adminSupabase
    .from('partner_organizations')
    .select('id, user_id, organization_name, siret, organization_type, organization_subtype, territory_scope, territory_codes, justification_url, intervention_categories, created_at')
    .eq('is_validated', false)
    .eq('is_rejected', false)
    .order('created_at', { ascending: true });

  const pendingOrgs: RawOrg[] = (orgs as RawOrg[] | null) ?? [];

  // Fetch auth user emails in bulk
  const { data: authUsers } = await adminSupabase.auth.admin.listUsers({ perPage: 1000 });
  const userMap: Record<string, { email: string; first_name: string; last_name: string }> = {};
  for (const u of authUsers?.users ?? []) {
    userMap[u.id] = {
      email: u.email ?? '',
      first_name: u.user_metadata?.first_name ?? '',
      last_name: u.user_metadata?.last_name ?? '',
    };
  }

  const applications: PartnerApplication[] = pendingOrgs.map((org) => ({
    ...org,
    contact_email: userMap[org.user_id]?.email ?? '',
    contact_first_name: userMap[org.user_id]?.first_name ?? '',
    contact_last_name: userMap[org.user_id]?.last_name ?? '',
  }));

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navigation />
      <main className="max-w-5xl mx-auto px-4 py-12">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 bg-amber-50 text-amber-700 text-xs font-medium px-3 py-1 rounded-full mb-4">
            Administration
          </div>
          <h1 className="text-2xl font-bold text-neutral-900 mb-2">
            Validation des demandes partenaires
          </h1>
          <p className="text-neutral-500">
            {applications.length === 0
              ? 'Aucune demande en attente.'
              : `${applications.length} demande${applications.length > 1 ? 's' : ''} en attente de validation`}
          </p>
        </div>

        <PartnerValidationsList applications={applications} />
      </main>
    </div>
  );
}
