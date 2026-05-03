import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Navigation from '@/components/Navigation';
import InterventionCategoriesForm from './InterventionCategoriesForm';

export default async function InterventionCategoriesPage() {
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
    .select('organization_name, is_validated, intervention_categories')
    .eq('user_id', user.id)
    .single();

  if (!org) redirect('/partenaires/inscription');
  if (!org.is_validated) redirect('/partenaires/en-attente');

  const cats = (org.intervention_categories ?? []) as string[];
  if (cats.length > 0) redirect('/partenaires/dashboard');

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navigation />
      <InterventionCategoriesForm organizationName={org.organization_name as string} />
    </div>
  );
}
