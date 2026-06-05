'use client';

import { useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';

const INTENTIONS = [
  { value: 'accompaniment', label: 'Accompagnement / Conseil' },
  { value: 'financing',     label: 'Financement / Subvention' },
  { value: 'networking',    label: 'Mise en réseau' },
  { value: 'training',      label: 'Formation / Montée en compétences' },
  { value: 'other',         label: 'Autre' },
];

export default function ContactRequestModal({
  targetProfileId,
  targetName,
  onSuccess,
  onClose,
}: {
  targetProfileId: string;
  targetName: string;
  onSuccess: (profileId: string) => void;
  onClose: () => void;
}) {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [intention, setIntention] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!intention) {
      setError('Sélectionnez une intention.');
      return;
    }
    if (message.trim().length < 50) {
      setError(`Le message doit comporter au moins 50 caractères (${message.trim().length}/50).`);
      return;
    }

    setIsSubmitting(true);
    try {
      const { data, error: rpcError } = await supabase.rpc('create_contact_request', {
        p_target_profile_id: targetProfileId,
        p_message: message.trim(),
        p_intention: intention,
      });

      if (rpcError) {
        setError(rpcError.message);
        return;
      }

      const result = data as { error?: string; success?: boolean };
      if (result?.error) {
        setError(result.error);
        return;
      }

      onSuccess(targetProfileId);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
          <div>
            <h2 className="text-base font-semibold text-neutral-900">Contacter {targetName}</h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              L'adresse email ne sera partagée qu'en cas d'acceptation
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-700 p-1"
            aria-label="Fermer"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">
              Intention <span className="text-red-500">*</span>
            </label>
            <select
              value={intention}
              onChange={(e) => setIntention(e.target.value)}
              className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
            >
              <option value="">-- Sélectionner --</option>
              {INTENTIONS.map((i) => (
                <option key={i.value} value={i.value}>{i.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">
              Message <span className="text-red-500">*</span>
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
              placeholder="Présentez-vous et expliquez votre démarche (minimum 50 caractères)…"
              className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
            />
            <p className={`text-xs mt-1 ${message.trim().length < 50 ? 'text-neutral-400' : 'text-green-600'}`}>
              {message.trim().length} / 50 caractères minimum
            </p>
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <div className="flex gap-3 pt-1">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-primary-600 hover:bg-primary-700 disabled:opacity-60 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors"
            >
              {isSubmitting ? 'Envoi…' : 'Envoyer la demande'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 border border-neutral-200 text-neutral-600 text-sm font-medium rounded-lg hover:bg-neutral-50 transition-colors"
            >
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
