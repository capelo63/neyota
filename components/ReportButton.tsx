'use client';

import { useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';

interface ReportButtonProps {
  targetType: 'profile' | 'project';
  targetId: string;
  targetName?: string;
  currentUserId: string | null;
}

const REPORT_REASONS = [
  { value: 'spam', label: '📢 Spam ou contenu non sollicité' },
  { value: 'fake_profile', label: '🎭 Profil ou projet fictif' },
  { value: 'inappropriate_content', label: '🚫 Contenu inapproprié' },
  { value: 'scam', label: '⚠️ Arnaque ou fraude' },
  { value: 'harassment', label: '😡 Harcèlement ou comportement abusif' },
  { value: 'other', label: '📝 Autre raison' },
];

type Step = 'closed' | 'form' | 'success' | 'already_reported' | 'error';

export default function ReportButton({
  targetType,
  targetId,
  targetName,
  currentUserId,
}: ReportButtonProps) {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [step, setStep] = useState<Step>('closed');
  const [selectedReason, setSelectedReason] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpen = async () => {
    if (!currentUserId) {
      window.location.href = '/login';
      return;
    }
    setStep('form');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReason || !currentUserId) return;

    setIsSubmitting(true);

    try {
      const insertData: any = {
        reporter_id: currentUserId,
        reason: selectedReason,
        description: description.trim() || null,
      };

      if (targetType === 'profile') {
        insertData.reported_profile_id = targetId;
      } else {
        insertData.reported_project_id = targetId;
      }

      const { error } = await supabase.from('reports').insert(insertData);

      if (error) {
        if (error.code === '23505') {
          // Unique constraint violation = already reported
          setStep('already_reported');
        } else {
          console.error('Report error:', error);
          setStep('error');
        }
      } else {
        setStep('success');
      }
    } catch (error) {
      console.error('Report error:', error);
      setStep('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setStep('closed');
    setSelectedReason('');
    setDescription('');
  };

  const targetLabel = targetType === 'profile' ? 'ce profil' : 'ce projet';

  return (
    <>
      {/* Report trigger button */}
      <button
        onClick={handleOpen}
        className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-error-500 transition-colors py-1 px-2 rounded hover:bg-error-50"
        title={`Signaler ${targetLabel}`}
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9"
          />
        </svg>
        Signaler
      </button>

      {/* Modal overlay */}
      {step !== 'closed' && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) handleClose();
          }}
        >
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 relative">
            {/* Close button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-600"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Form */}
            {step === 'form' && (
              <>
                <div className="mb-5">
                  <div className="text-2xl mb-2">🚩</div>
                  <h2 className="text-lg font-semibold text-neutral-900">
                    Signaler {targetLabel}
                  </h2>
                  {targetName && (
                    <p className="text-sm text-neutral-500 mt-1">
                      « {targetName} »
                    </p>
                  )}
                  <p className="text-sm text-neutral-600 mt-2">
                    Votre signalement sera examiné par notre équipe dans les plus brefs délais.
                    Merci de contribuer à la sécurité de la communauté Teriis.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Motif du signalement *
                    </label>
                    <div className="space-y-2">
                      {REPORT_REASONS.map((reason) => (
                        <label
                          key={reason.value}
                          className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                            selectedReason === reason.value
                              ? 'border-error-400 bg-error-50'
                              : 'border-neutral-200 hover:bg-neutral-50'
                          }`}
                        >
                          <input
                            type="radio"
                            name="reason"
                            value={reason.value}
                            checked={selectedReason === reason.value}
                            onChange={(e) => setSelectedReason(e.target.value)}
                            className="text-error-500"
                          />
                          <span className="text-sm text-neutral-700">{reason.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                      Détails supplémentaires (optionnel)
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Décrivez le problème en quelques mots..."
                      rows={3}
                      maxLength={500}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-error-400"
                    />
                    <p className="text-xs text-neutral-400 text-right mt-1">
                      {description.length}/500
                    </p>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={handleClose}
                      className="flex-1 px-4 py-2.5 border border-neutral-300 rounded-lg text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      disabled={!selectedReason || isSubmitting}
                      className="flex-1 px-4 py-2.5 bg-error-600 text-white rounded-lg text-sm font-medium hover:bg-error-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {isSubmitting ? 'Envoi...' : 'Envoyer le signalement'}
                    </button>
                  </div>
                </form>
              </>
            )}

            {/* Success */}
            {step === 'success' && (
              <div className="text-center py-4">
                <div className="text-4xl mb-3">✅</div>
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                  Signalement envoyé
                </h3>
                <p className="text-sm text-neutral-600 mb-5">
                  Merci pour votre contribution. Notre équipe va examiner ce signalement
                  et prendre les mesures nécessaires.
                </p>
                <button
                  onClick={handleClose}
                  className="px-6 py-2.5 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
                >
                  Fermer
                </button>
              </div>
            )}

            {/* Already reported */}
            {step === 'already_reported' && (
              <div className="text-center py-4">
                <div className="text-4xl mb-3">ℹ️</div>
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                  Déjà signalé
                </h3>
                <p className="text-sm text-neutral-600 mb-5">
                  Vous avez déjà signalé {targetLabel}. Notre équipe est en train de l'examiner.
                </p>
                <button
                  onClick={handleClose}
                  className="px-6 py-2.5 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
                >
                  Fermer
                </button>
              </div>
            )}

            {/* Error */}
            {step === 'error' && (
              <div className="text-center py-4">
                <div className="text-4xl mb-3">⚠️</div>
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                  Une erreur est survenue
                </h3>
                <p className="text-sm text-neutral-600 mb-5">
                  Impossible d'envoyer le signalement. Veuillez réessayer.
                </p>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => setStep('form')}
                    className="px-6 py-2.5 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
                  >
                    Réessayer
                  </button>
                  <button
                    onClick={handleClose}
                    className="px-6 py-2.5 border border-neutral-300 rounded-lg text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
                  >
                    Fermer
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
