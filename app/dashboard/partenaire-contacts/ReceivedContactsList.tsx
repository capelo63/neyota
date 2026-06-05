'use client';

import { useState } from 'react';
import Link from 'next/link';

const INTENTION_LABELS: Record<string, string> = {
  accompaniment: 'Accompagnement / Conseil',
  financing:     'Financement / Subvention',
  networking:    'Mise en réseau',
  training:      'Formation / Montée en compétences',
  other:         'Autre',
};

const ORG_TYPE_LABELS: Record<string, string> = {
  public_collectivity: 'Collectivité territoriale',
  public_support:      "Structure publique d'accompagnement",
  consular_chamber:    'Chambre consulaire',
  nonprofit_network:   "Réseau d'accompagnement",
  incubator_accelerator: 'Incubateur ou accélérateur',
  foundation:          'Fondation',
  private_financial:   'Partenaire financier privé',
  service_provider:    'Prestataire de services',
  other_commercial:    'Autre acteur commercial',
};

export type ReceivedRequest = {
  id: string;
  partner_user_id: string;
  org_name: string;
  org_type: string;
  partner_first_name: string;
  partner_last_name: string;
  intention: string;
  message: string;
  status: string;
  created_at: string;
  responded_at: string | null;
};

export default function ReceivedContactsList({ requests }: { requests: ReceivedRequest[] }) {
  const [statuses, setStatuses] = useState<Record<string, string>>(
    () => Object.fromEntries(requests.map((r) => [r.id, r.status]))
  );
  const [declining, setDeclining] = useState<string | null>(null);
  const [declineReason, setDeclineReason] = useState('');
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState('');

  const [filter, setFilter] = useState<'all' | 'pending' | 'accepted' | 'declined'>('all');

  const filtered = requests.filter((r) => filter === 'all' || statuses[r.id] === filter);
  const pendingCount = requests.filter((r) => statuses[r.id] === 'pending').length;

  async function respond(requestId: string, response: 'accepted' | 'declined', reason?: string) {
    setError('');
    setLoading(requestId);
    try {
      const res = await fetch('/api/partenaires/contact/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ request_id: requestId, response, decline_reason: reason ?? null }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setError(data.error ?? 'Une erreur est survenue.');
        return;
      }
      setStatuses((prev: Record<string, string>) => ({ ...prev, [requestId]: response }));
      setDeclining(null);
      setDeclineReason('');
    } finally {
      setLoading(null);
    }
  }

  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-6">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-700 mb-4"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Retour au tableau de bord
        </Link>
        <h1 className="text-2xl font-bold text-neutral-900">Demandes de contact partenaires</h1>
        <p className="text-sm text-neutral-500 mt-1">
          {requests.length} demande{requests.length !== 1 ? 's' : ''} reçue{requests.length !== 1 ? 's' : ''}
          {pendingCount > 0 && ` · ${pendingCount} en attente`}
        </p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 mb-5 border-b border-neutral-200">
        {(['all', 'pending', 'accepted', 'declined'] as const).map((f) => {
          const labels = { all: 'Toutes', pending: 'En attente', accepted: 'Acceptées', declined: 'Déclinées' };
          const count = f === 'all' ? requests.length : requests.filter((r) => statuses[r.id] === f).length;
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
                filter === f
                  ? 'text-primary-600 border-primary-600'
                  : 'text-neutral-500 border-transparent hover:text-neutral-700'
              }`}
            >
              {labels[f]} {count > 0 && <span className="ml-1 text-xs opacity-70">({count})</span>}
            </button>
          );
        })}
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-4">
          {error}
        </p>
      )}

      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-neutral-200 p-12 text-center">
          <p className="text-neutral-500 text-sm">
            {filter === 'all'
              ? 'Aucun partenaire ne vous a encore contacté.'
              : `Aucune demande ${filter === 'pending' ? 'en attente' : filter === 'accepted' ? 'acceptée' : 'déclinée'}.`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((r) => {
            const currentStatus = statuses[r.id];
            return (
              <div key={r.id} className="bg-white rounded-xl border border-neutral-200 p-5">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-neutral-900">{r.org_name}</span>
                      <span className="text-xs text-neutral-500">
                        {ORG_TYPE_LABELS[r.org_type] ?? r.org_type}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-400 mt-0.5">
                      Contact : {r.partner_first_name} {r.partner_last_name}
                    </p>
                  </div>
                  <span className={`shrink-0 text-xs font-medium px-2.5 py-1 rounded-full border ${
                    currentStatus === 'accepted'
                      ? 'bg-green-50 text-green-700 border-green-200'
                      : currentStatus === 'declined'
                      ? 'bg-neutral-100 text-neutral-500 border-neutral-200'
                      : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                  }`}>
                    {currentStatus === 'accepted' ? 'Acceptée' : currentStatus === 'declined' ? 'Déclinée' : 'En attente'}
                  </span>
                </div>

                <div className="mt-3 space-y-1">
                  <p className="text-xs font-medium text-neutral-500">
                    Intention : {INTENTION_LABELS[r.intention] ?? r.intention}
                  </p>
                  <p className="text-sm text-neutral-700 bg-neutral-50 rounded-lg p-3 italic leading-relaxed">
                    "{r.message}"
                  </p>
                </div>

                {currentStatus === 'pending' && (
                  <>
                    {declining === r.id ? (
                      <div className="mt-4 space-y-3">
                        <textarea
                          value={declineReason}
                          onChange={(e) => setDeclineReason(e.target.value)}
                          rows={3}
                          placeholder="Motif du refus (optionnel)…"
                          className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => respond(r.id, 'declined', declineReason || undefined)}
                            disabled={loading === r.id}
                            className="flex-1 bg-neutral-700 hover:bg-neutral-800 disabled:opacity-60 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                          >
                            {loading === r.id ? 'Envoi…' : 'Confirmer le refus'}
                          </button>
                          <button
                            onClick={() => { setDeclining(null); setDeclineReason(''); }}
                            className="px-4 py-2 border border-neutral-200 text-neutral-600 text-sm rounded-lg hover:bg-neutral-50"
                          >
                            Annuler
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex gap-2 mt-4">
                        <button
                          onClick={() => respond(r.id, 'accepted')}
                          disabled={loading === r.id}
                          className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
                        >
                          {loading === r.id ? 'Envoi…' : 'Accepter et partager mon email'}
                        </button>
                        <button
                          onClick={() => setDeclining(r.id)}
                          className="px-4 py-2 border border-neutral-200 text-neutral-600 text-sm font-medium rounded-lg hover:bg-neutral-50 transition-colors"
                        >
                          Décliner
                        </button>
                      </div>
                    )}
                    <p className="text-xs text-neutral-400 mt-2">
                      En acceptant, votre adresse email sera communiquée au partenaire.
                    </p>
                  </>
                )}

                <p className="text-xs text-neutral-400 mt-3">
                  Reçue le {new Date(r.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
