import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Navigation from '@/components/Navigation';
import PartnerProfileEditForm from './PartnerProfileEditForm';

export default async function PartnerProfileEditPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== 'partner') redirect('/dashboard');

  const { data: org } = await supabase
    .from('partner_organizations')
    .select('organization_name, organization_type, organization_subtype, siret, territory_scope, territory_codes, intervention_categories, is_validated, is_rejected')
    .eq('user_id', user.id)
    .single();

  if (!org) redirect('/partenaires/inscription');
  if (!org.is_validated) redirect('/partenaires/en-attente');

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navigation />
      <PartnerProfileEditForm
        userId={user.id}
        org={{
          organization_name:       org.organization_name as string,
          organization_type:       org.organization_type as string,
          organization_subtype:    org.organization_subtype as string | null,
          siret:                   org.siret as string | null,
          territory_scope:         (org.territory_scope as string | null) ?? 'national',
          territory_codes:         (org.territory_codes as string[] | null) ?? [],
          intervention_categories: (org.intervention_categories as string[] | null) ?? [],
        }}
      />
    </div>
  );
}
