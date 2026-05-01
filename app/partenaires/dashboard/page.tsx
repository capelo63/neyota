import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Navigation from '@/components/Navigation';
import PartnerDashboard from './PartnerDashboard';

export type VisibleProfile = {
  id: string;
  first_name: string;
  last_name: string;
  role: 'entrepreneur' | 'talent';
  bio: string | null;
  city: string;
  postal_code: string;
  region: string | null;
  avatar_url: string | null;
  latitude: number | null;
  longitude: number | null;
};

export type PartnerOrg = {
  organization_name: string;
  organization_type: string;
  territory_scope: string | null;
  territory_codes: string[] | null;
};

export default async function PartnerDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== 'partner') {
    redirect('/dashboard');
  }

  const { data: org } = await supabase
    .from('partner_organizations')
    .select('organization_name, organization_type, territory_scope, territory_codes, is_validated, is_rejected')
    .eq('user_id', user.id)
    .single();

  if (!org) {
    redirect('/partenaires/inscription');
  }

  if (!org.is_validated) {
    redirect('/partenaires/en-attente');
  }

  const { data: profiles } = await supabase
    .rpc('get_partner_visible_profiles');

  const visibleProfiles: VisibleProfile[] = (profiles ?? []).map((p: VisibleProfile) => p);

  const partnerOrg: PartnerOrg = {
    organization_name: org.organization_name,
    organization_type: org.organization_type,
    territory_scope: org.territory_scope,
    territory_codes: org.territory_codes,
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navigation />
      <PartnerDashboard org={partnerOrg} profiles={visibleProfiles} />
    </div>
  );
}
