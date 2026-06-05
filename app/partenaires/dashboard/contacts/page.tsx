import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import Navigation from '@/components/Navigation';

const INTENTION_LABELS: Record<string, string> = {
  accompaniment: 'Accompagnement / Conseil',
  financing:     'Financement / Subvention',
  networking:    'Mise en réseau',
  training:      'Formation / Montée en compétences',
  other:         'Autre',
};

const STATUS_CONFIG = {
  pending:  { label: 'En attente',  cls: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
  accepted: { label: 'Accepté',     cls: 'bg-green-50 text-green-700 border-green-200' },
  declined: { label: 'Décliné',     cls: 'bg-neutral-100 text-neutral-500 border-neutral-200' },
};

type ContactRequest = {
  id: string;
  target_profile_id: string;
  target_first_name: string;
  target_last_name: string;
  target_role: string;
  target_city: string;
  target_email: string | null;
  intention: string;
  message: string;
  status: string;
  decline_reason: string | null;
  created_at: string;
  responded_at: string | null;
};

export default async function PartnerContactsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== 'partner') redirect('/dashboard');

  const { data: requests } = await supabase.rpc('get_partner_contact_requests');
  const list = (requests ?? []) as ContactRequest[];

  const pending  = list.filter((r) => r.status === 'pending');
  const accepted = list.filter((r) => r.status === 'accepted');
  const declined = list.filter((r) => r.status === 'declined');

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navigation />
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Back + header */}
        <div className="mb-6">
          <Link
            href="/partenaires/dashboard"
            className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-700 mb-4"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Retour à l'annuaire
          </Link>

          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-neutral-900">Mes demandes de contact</h1>
              <p className="text-sm text-neutral-500 mt-1">
                {list.length} demande{list.length !== 1 ? 's' : ''} envoyée{list.length !== 1 ? 's' : ''}
              </p>
            </div>
            {/* Summary badges */}
            <div className="flex gap-2 shrink-0 flex-wrap justify-end">
              {pending.length > 0 && (
                <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-yellow-50 text-yellow-700 border border-yellow-200">
                  {pending.length} en attente
                </span>
              )}
              {accepted.length > 0 && (
                <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-green-50 text-green-700 border border-green-200">
                  {accepted.length} accepté{accepted.length !== 1 ? 's' : ''}
                </span>
              )}
            </div>
          </div>
        </div>

        {list.length === 0 ? (
          <div className="bg-white rounded-2xl border border-neutral-200 p-12 text-center">
            <p className="text-neutral-500 text-sm">
              Vous n'avez pas encore envoyé de demande de contact.
            </p>
            <Link
              href="/partenaires/dashboard"
              className="inline-block mt-4 text-sm font-medium text-primary-600 hover:underline"
            >
              Explorer les profils →
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {list.map((r) => {
              const cfg = STATUS_CONFIG[r.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.pending;
              return (
                <div key={r.id} className="bg-white rounded-xl border border-neutral-200 p-5">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Link
                          href={`/profile/${r.target_profile_id}`}
                          target="_blank"
                          className="font-semibold text-neutral-900 hover:text-primary-700"
                        >
                          {r.target_first_name} {r.target_last_name}
                        </Link>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          r.target_role === 'entrepreneur'
                            ? 'bg-orange-50 text-orange-700'
                            : 'bg-green-50 text-green-700'
                        }`}>
                          {r.target_role === 'entrepreneur' ? 'Porteur d\'initiative' : 'Talent'}
                        </span>
                        <span className="text-xs text-neutral-400">{r.target_city}</span>
                      </div>
                      <p className="text-xs text-neutral-500 mt-1">
                        Intention : <span className="font-medium">{INTENTION_LABELS[r.intention] ?? r.intention}</span>
                      </p>
                    </div>
                    <span className={`shrink-0 text-xs font-medium px-2.5 py-1 rounded-full border ${cfg.cls}`}>
                      {cfg.label}
                    </span>
                  </div>

                  <p className="text-sm text-neutral-600 mt-3 line-clamp-3 leading-relaxed bg-neutral-50 rounded-lg p-3 italic">
                    "{r.message}"
                  </p>

                  {r.status === 'accepted' && r.target_email && (
                    <div className="mt-3 bg-green-50 border border-green-200 rounded-lg px-3 py-2.5 flex items-center gap-2">
                      <svg className="w-4 h-4 text-green-600 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <a
                        href={`mailto:${r.target_email}`}
                        className="text-sm font-medium text-green-800 hover:underline"
                      >
                        {r.target_email}
                      </a>
                    </div>
                  )}

                  {r.status === 'declined' && r.decline_reason && (
                    <div className="mt-3 text-sm text-neutral-500 bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-2">
                      <span className="font-medium">Motif : </span>{r.decline_reason}
                    </div>
                  )}

                  <p className="text-xs text-neutral-400 mt-3">
                    Envoyée le {new Date(r.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                    {r.responded_at && ` · Réponse le ${new Date(r.responded_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}`}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
