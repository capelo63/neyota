import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import Navigation from '@/components/Navigation';
import { getOrgTypeLabel } from '@/lib/constants/france-geo';

export default async function EnAttentePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/partenaires/inscription');
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
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (!org) {
    redirect('/partenaires/inscription');
  }

  if (org.is_validated) {
    redirect('/partenaires/dashboard');
  }

  const scopeLabel: Record<string, string> = {
    national: 'National',
    regional: 'Régional',
    departmental: 'Départemental',
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navigation />
      <main className="max-w-2xl mx-auto px-4 py-16">
        {org.is_rejected ? (
          <div className="bg-white rounded-2xl shadow-sm border border-red-200 p-8 text-center">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-neutral-900 mb-3">Demande non retenue</h1>
            <p className="text-neutral-600 mb-6">
              Votre demande d'accès partenaire pour <strong>{org.organization_name}</strong> n'a pas été retenue.
            </p>
            {org.rejection_reason && (
              <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-4 text-left mb-6">
                <p className="text-sm font-semibold text-neutral-700 mb-1">Motif communiqué :</p>
                <p className="text-sm text-neutral-600">{org.rejection_reason}</p>
              </div>
            )}
            <p className="text-sm text-neutral-500 mb-8">
              Pour toute question, contactez-nous à{' '}
              <a href="mailto:contact@neyota.com" className="text-primary-600 hover:underline">
                contact@neyota.com
              </a>.
            </p>
            <Link href="/" className="text-sm text-neutral-500 hover:text-neutral-800 transition-colors">
              ← Retour à l'accueil
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-8 text-center">
            <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-primary-500" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2m6-2a10 10 0 11-20 0 10 10 0 0120 0z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-neutral-900 mb-3">
              Demande en cours d'examen
            </h1>
            <p className="text-neutral-600 mb-8 leading-relaxed">
              Votre demande d'accès partenaire a bien été reçue. Notre équipe va l'examiner et vous
              répondra par email sous 48–72 heures ouvrées.
            </p>

            <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-5 text-left mb-8">
              <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-3">
                Récapitulatif de votre demande
              </p>
              <dl className="space-y-2.5 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-neutral-500">Organisation</dt>
                  <dd className="font-medium text-neutral-900 text-right">{org.organization_name}</dd>
                </div>
                {org.siret && (
                  <div className="flex justify-between gap-4">
                    <dt className="text-neutral-500">SIRET</dt>
                    <dd className="font-mono text-neutral-800">{org.siret}</dd>
                  </div>
                )}
                <div className="flex justify-between gap-4">
                  <dt className="text-neutral-500">Type</dt>
                  <dd className="font-medium text-neutral-900 text-right">
                    {getOrgTypeLabel(org.organization_type)}
                  </dd>
                </div>
                {org.territory_scope && (
                  <div className="flex justify-between gap-4">
                    <dt className="text-neutral-500">Périmètre</dt>
                    <dd className="font-medium text-neutral-900">
                      {scopeLabel[org.territory_scope] ?? org.territory_scope}
                    </dd>
                  </div>
                )}
                <div className="flex justify-between gap-4">
                  <dt className="text-neutral-500">Déposée le</dt>
                  <dd className="text-neutral-700">
                    {new Date(org.created_at).toLocaleDateString('fr-FR', {
                      day: 'numeric', month: 'long', year: 'numeric',
                    })}
                  </dd>
                </div>
              </dl>
            </div>

            <p className="text-sm text-neutral-500">
              Une question ?{' '}
              <a href="mailto:contact@neyota.com" className="text-primary-600 hover:underline">
                Contactez-nous
              </a>
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
