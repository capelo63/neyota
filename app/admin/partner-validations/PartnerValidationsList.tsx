'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getOrgTypeLabel } from '@/lib/constants/france-geo';
import type { PartnerApplication } from './page';

const SCOPE_LABEL: Record<string, string> = {
  national: 'National',
  regional: 'Régional',
  departmental: 'Départemental',
};

export default function PartnerValidationsList({ applications }: { applications: PartnerApplication[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [error, setError] = useState<string | null>(null);

  async function handleValidate(partnerId: string) {
    setLoading(partnerId);
    setError(null);
    try {
      const res = await fetch('/api/admin/partner-validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ partnerId }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error ?? 'Erreur lors de la validation.');
      }
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur inattendue.');
    } finally {
      setLoading(null);
    }
  }

  async function handleReject(partnerId: string) {
    setLoading(partnerId);
    setError(null);
    try {
      const res = await fetch('/api/admin/partner-reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ partnerId, rejectionReason: rejectionReason.trim() || null }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error ?? 'Erreur lors du rejet.');
      }
      setRejectingId(null);
      setRejectionReason('');
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur inattendue.');
    } finally {
      setLoading(null);
    }
  }

  if (applications.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-neutral-200 p-12 text-center">
        <p className="text-neutral-500">Aucune demande en attente de validation.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {applications.map((app) => (
        <div
          key={app.id}
          className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden"
        >
          <div className="p-6">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h2 className="text-lg font-semibold text-neutral-900">{app.organization_name}</h2>
                <p className="text-sm text-neutral-500 mt-0.5">
                  {app.contact_first_name} {app.contact_last_name}
                  {app.contact_email && (
                    <> · <a href={`mailto:${app.contact_email}`} className="text-primary-600 hover:underline">{app.contact_email}</a></>
                  )}
                </p>
              </div>
              <span className="shrink-0 text-xs font-medium bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full">
                En attente
              </span>
            </div>

            <dl className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mb-4">
              <div>
                <dt className="text-xs text-neutral-400 mb-0.5">Type</dt>
                <dd className="font-medium text-neutral-800">{getOrgTypeLabel(app.organization_type)}</dd>
              </div>
              {app.siret && (
                <div>
                  <dt className="text-xs text-neutral-400 mb-0.5">SIRET</dt>
                  <dd className="font-mono text-neutral-800">{app.siret}</dd>
                </div>
              )}
              {app.territory_scope && (
                <div>
                  <dt className="text-xs text-neutral-400 mb-0.5">Périmètre</dt>
                  <dd className="font-medium text-neutral-800">
                    {SCOPE_LABEL[app.territory_scope] ?? app.territory_scope}
                  </dd>
                </div>
              )}
              <div>
                <dt className="text-xs text-neutral-400 mb-0.5">Déposée le</dt>
                <dd className="text-neutral-700">
                  {new Date(app.created_at).toLocaleDateString('fr-FR', {
                    day: 'numeric', month: 'short', year: 'numeric',
                  })}
                </dd>
              </div>
            </dl>

            {app.organization_subtype && (
              <p className="text-sm text-neutral-600 mb-3">
                <span className="font-medium">Précision :</span> {app.organization_subtype}
              </p>
            )}

            {app.territory_codes && app.territory_codes.length > 0 && (
              <p className="text-sm text-neutral-600 mb-3">
                <span className="font-medium">Codes territoire :</span>{' '}
                {app.territory_codes.join(', ')}
              </p>
            )}

            {app.justification_url && (
              <p className="text-sm mb-3">
                <span className="font-medium text-neutral-600">Lien justificatif :</span>{' '}
                <a
                  href={app.justification_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-600 hover:underline break-all"
                >
                  {app.justification_url}
                </a>
              </p>
            )}
          </div>

          {/* Reject form (inline) */}
          {rejectingId === app.id && (
            <div className="border-t border-neutral-100 bg-neutral-50 px-6 py-4">
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Motif du rejet <span className="font-normal text-neutral-400">(optionnel — transmis au partenaire)</span>
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={3}
                placeholder="Ex : activité commerciale non éligible au statut partenaire institutionnel."
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-300 resize-none"
              />
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => handleReject(app.id)}
                  disabled={loading === app.id}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-60"
                >
                  {loading === app.id ? 'Rejet en cours…' : 'Confirmer le rejet'}
                </button>
                <button
                  onClick={() => { setRejectingId(null); setRejectionReason(''); }}
                  className="px-4 py-2 bg-white border border-neutral-300 text-neutral-700 text-sm font-medium rounded-lg hover:bg-neutral-50 transition-colors"
                >
                  Annuler
                </button>
              </div>
            </div>
          )}

          {/* Action buttons */}
          {rejectingId !== app.id && (
            <div className="border-t border-neutral-100 px-6 py-4 flex gap-3">
              <button
                onClick={() => handleValidate(app.id)}
                disabled={loading === app.id}
                className="px-5 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-60"
              >
                {loading === app.id ? 'Validation…' : 'Valider'}
              </button>
              <button
                onClick={() => setRejectingId(app.id)}
                disabled={loading === app.id}
                className="px-5 py-2 bg-white border border-red-300 text-red-600 hover:bg-red-50 text-sm font-medium rounded-lg transition-colors disabled:opacity-60"
              >
                Rejeter
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
