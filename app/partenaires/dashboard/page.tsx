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
  // Enrichment — fetched via get_partner_profile_extras
  project_phases: string[];
  need_categories: string[];
  skill_categories: string[];
  project_categories: string[];
};

export type PartnerOrg = {
  organization_name: string;
  organization_type: string;
  territory_scope: string | null;
  territory_codes: string[] | null;
};

type ExtrasRow = {
  profile_id: string;
  project_phases: string[];
  need_categories: string[];
  skill_categories: string[];
  project_categories: string[];
};

export default async function PartnerDashboardPage() {
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
    .select('organization_name, organization_type, territory_scope, territory_codes, is_validated, is_rejected')
    .eq('user_id', user.id)
    .single();

  if (!org) redirect('/partenaires/inscription');
  if (!org.is_validated) redirect('/partenaires/en-attente');

  // Basic profiles (SECURITY DEFINER bypasses RLS)
  const { data: rawProfiles } = await supabase.rpc('get_partner_visible_profiles');
  const basicProfiles = (rawProfiles ?? []) as Omit<VisibleProfile, 'project_phases' | 'need_categories' | 'skill_categories'>[];

  // Enrichment: project phases, need categories, skill categories
  const profileIds = basicProfiles.map((p) => p.id);
  const extrasMap = new Map<string, ExtrasRow>();

  if (profileIds.length > 0) {
    const { data: extrasData } = await supabase.rpc('get_partner_profile_extras', {
      p_profile_ids: profileIds,
    });
    ((extrasData ?? []) as ExtrasRow[]).forEach((e) => extrasMap.set(e.profile_id, e));
  }

  const visibleProfiles: VisibleProfile[] = basicProfiles.map((p) => ({
    ...p,
    project_phases:    extrasMap.get(p.id)?.project_phases    ?? [],
    need_categories:   extrasMap.get(p.id)?.need_categories   ?? [],
    skill_categories:  extrasMap.get(p.id)?.skill_categories  ?? [],
    project_categories: extrasMap.get(p.id)?.project_categories ?? [],
  }));

  // Initial favorites for the current partner
  const { data: favData } = await supabase
    .from('partner_favorites')
    .select('favorite_profile_id')
    .eq('partner_user_id', user.id);
  const initialFavoriteIds = (favData ?? []).map((f) => f.favorite_profile_id as string);

  const partnerOrg: PartnerOrg = {
    organization_name: org.organization_name,
    organization_type: org.organization_type,
    territory_scope:   org.territory_scope,
    territory_codes:   org.territory_codes,
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navigation />
      <PartnerDashboard
        org={partnerOrg}
        profiles={visibleProfiles}
        initialFavoriteIds={initialFavoriteIds}
      />
    </div>
  );
}
