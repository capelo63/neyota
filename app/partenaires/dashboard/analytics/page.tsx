import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Navigation from '@/components/Navigation';
import AnalyticsDashboard from './AnalyticsDashboard';
import type { PartnerOrg } from '../page';
import type { AnalyticsData } from './AnalyticsDashboard';

type AnalyticsRow = {
  total_views:            number;
  unique_profiles_viewed: number;
  favorites_count:        number;
  visible_profiles_count: number;
  views_by_day:    { day: string; count: number }[] | null;
  recent_views:    {
    profile_id: string;
    first_name: string;
    last_name: string;
    city: string;
    role: string;
    avatar_url: string | null;
    viewed_at: string;
  }[] | null;
  top_categories:              { category: string; count: number }[] | null;
  intervention_category_counts: { category: string; count: number }[] | null;
};

export default async function PartnerAnalyticsPage() {
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
    .select('organization_name, organization_type, territory_scope, territory_codes, is_validated, is_rejected, intervention_categories')
    .eq('user_id', user.id)
    .single();

  if (!org) redirect('/partenaires/inscription');
  if (!org.is_validated) redirect('/partenaires/en-attente');

  const { data: rows } = await supabase.rpc('get_partner_analytics');
  const raw = ((rows ?? []) as AnalyticsRow[])[0] ?? null;

  const analytics: AnalyticsData = {
    total_views:            raw?.total_views            ?? 0,
    unique_profiles_viewed: raw?.unique_profiles_viewed ?? 0,
    favorites_count:        raw?.favorites_count        ?? 0,
    visible_profiles_count: raw?.visible_profiles_count ?? 0,
    views_by_day:                raw?.views_by_day                ?? [],
    recent_views:                raw?.recent_views                ?? [],
    top_categories:              raw?.top_categories              ?? [],
    intervention_category_counts: raw?.intervention_category_counts ?? [],
  };

  const partnerOrg: PartnerOrg = {
    organization_name: org.organization_name,
    organization_type: org.organization_type,
    territory_scope:   org.territory_scope,
    territory_codes:   org.territory_codes,
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navigation />
      <AnalyticsDashboard org={partnerOrg} analytics={analytics} />
    </div>
  );
}
