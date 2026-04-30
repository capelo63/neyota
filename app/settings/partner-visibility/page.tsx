import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import PartnerVisibilityClient from './PartnerVisibilityClient';

export default async function PartnerVisibilityPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, role, bio, avatar_url, city, created_at')
    .eq('id', user.id)
    .single();

  if (!profile || (profile.role !== 'entrepreneur' && profile.role !== 'talent')) {
    redirect('/dashboard');
  }

  const { data: visibilitySettings } = await supabase
    .from('partner_visibility_settings')
    .select('visible_to_support_partners, visible_to_commercial_partners')
    .eq('user_id', user.id)
    .maybeSingle();

  // Critère 1 : profil complet
  const isProfileComplete = !!(
    profile.bio && profile.bio.trim().length >= 50 &&
    profile.avatar_url &&
    profile.city
  );

  // Critère 2 : au moins 1 projet actif (porteur) ou 3 compétences (talent)
  let hasProjectsOrSkills = false;
  if (profile.role === 'entrepreneur') {
    const { count } = await supabase
      .from('projects')
      .select('id', { count: 'exact', head: true })
      .eq('owner_id', user.id)
      .eq('status', 'active');
    hasProjectsOrSkills = (count ?? 0) > 0;
  } else {
    const { count } = await supabase
      .from('user_skills')
      .select('skill_id', { count: 'exact', head: true })
      .eq('user_id', user.id);
    hasProjectsOrSkills = (count ?? 0) >= 3;
  }

  // Critère 3 : profil créé il y a plus de 30 jours
  const ageMs = Date.now() - new Date(profile.created_at).getTime();
  const isOldEnough = ageMs > 30 * 24 * 60 * 60 * 1000;

  // Critère 4 : au moins une candidature reçue ou émise
  let hasApplications = false;
  if (profile.role === 'entrepreneur') {
    const { data: ownedProjects } = await supabase
      .from('projects')
      .select('id')
      .eq('owner_id', user.id);
    if (ownedProjects && ownedProjects.length > 0) {
      const { count } = await supabase
        .from('applications')
        .select('id', { count: 'exact', head: true })
        .in('project_id', ownedProjects.map((p) => p.id));
      hasApplications = (count ?? 0) > 0;
    }
  } else {
    const { count } = await supabase
      .from('applications')
      .select('id', { count: 'exact', head: true })
      .eq('talent_id', user.id);
    hasApplications = (count ?? 0) > 0;
  }

  return (
    <PartnerVisibilityClient
      userId={user.id}
      role={profile.role as 'entrepreneur' | 'talent'}
      initialSettings={{
        visible_to_support_partners:  visibilitySettings?.visible_to_support_partners  ?? false,
        visible_to_commercial_partners: visibilitySettings?.visible_to_commercial_partners ?? false,
      }}
      criteria={{ isProfileComplete, hasProjectsOrSkills, isOldEnough, hasApplications }}
    />
  );
}
