import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import ApplicationsManager from './ApplicationsManager';

export default async function ApplicationsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: project } = await supabase
    .from('projects')
    .select('owner_id')
    .eq('id', id)
    .single();

  if (!project || project.owner_id !== user.id) {
    redirect('/dashboard');
  }

  return <ApplicationsManager projectId={id} />;
}
