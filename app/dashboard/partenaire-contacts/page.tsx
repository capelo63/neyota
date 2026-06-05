import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Navigation from '@/components/Navigation';
import ReceivedContactsList, { type ReceivedRequest } from './ReceivedContactsList';

export default async function PartenairesContactsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || !['entrepreneur', 'talent'].includes(profile.role)) {
    redirect('/dashboard');
  }

  const { data: requests } = await supabase.rpc('get_received_contact_requests');

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navigation />
      <ReceivedContactsList requests={(requests ?? []) as ReceivedRequest[]} />
    </div>
  );
}
