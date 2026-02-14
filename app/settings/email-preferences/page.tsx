'use client';

import { useState, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { Button } from '@/components/ui';

interface EmailPreferences {
  digest_frequency: 'daily' | 'weekly' | 'never';
  instant_application_received: boolean;
  instant_invitation_received: boolean;
  instant_application_status: boolean;
  recommendations_in_digest: boolean;
  emails_enabled: boolean;
}

export default function EmailPreferencesPage() {
  const [preferences, setPreferences] = useState<EmailPreferences>({
    digest_frequency: 'weekly',
    instant_application_received: true,
    instant_invitation_received: true,
    instant_application_status: true,
    recommendations_in_digest: true,
    emails_enabled: true,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('email_preferences')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setPreferences(data);
      }
    } catch (err) {
      console.error('Error loading preferences:', err);
      setMessage({ type: 'error', text: 'Erreur lors du chargement des préférences' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setMessage(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Non authentifié');

      const { error } = await supabase
        .from('email_preferences')
        .upsert({
          user_id: user.id,
          ...preferences,
        });

      if (error) throw error;

      setMessage({ type: 'success', text: 'Préférences enregistrées avec succès !' });
    } catch (err: any) {
      console.error('Error saving preferences:', err);
      setMessage({ type: 'error', text: err.message || 'Erreur lors de la sauvegarde' });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-neutral-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">
            📧 Préférences d'emails
          </h1>
          <p className="text-neutral-600">
            Gérez les notifications que vous souhaitez recevoir par email
          </p>
        </div>

        {/* Message */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              message.type === 'success'
                ? 'bg-success-50 border border-success-200 text-success-700'
                : 'bg-error-50 border border-error-200 text-error-700'
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Global Toggle */}
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-neutral-900 mb-1">
                Activer les emails
              </h2>
              <p className="text-sm text-neutral-600">
                Désactiver complètement toutes les notifications par email
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.emails_enabled}
                onChange={(e) =>
                  setPreferences({ ...preferences, emails_enabled: e.target.checked })
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>
        </div>

        {/* Instant Notifications */}
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6 mb-6">
          <h2 className="text-xl font-semibold text-neutral-900 mb-4">
            📨 Notifications instantanées
          </h2>
          <p className="text-sm text-neutral-600 mb-6">
            Recevoir un email immédiatement pour les actions importantes
          </p>

          <div className="space-y-4">
            {/* Application received */}
            <div className="flex items-start justify-between py-3 border-b border-neutral-100">
              <div className="flex-1">
                <h3 className="font-medium text-neutral-900">Candidature reçue</h3>
                <p className="text-sm text-neutral-600">
                  Quand un talent postule à l'un de mes projets
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer ml-4">
                <input
                  type="checkbox"
                  checked={preferences.instant_application_received}
                  onChange={(e) =>
                    setPreferences({
                      ...preferences,
                      instant_application_received: e.target.checked,
                    })
                  }
                  disabled={!preferences.emails_enabled}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600 peer-disabled:opacity-50"></div>
              </label>
            </div>

            {/* Invitation received */}
            <div className="flex items-start justify-between py-3 border-b border-neutral-100">
              <div className="flex-1">
                <h3 className="font-medium text-neutral-900">Invitation reçue</h3>
                <p className="text-sm text-neutral-600">
                  Quand un entrepreneur m'invite à rejoindre un projet
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer ml-4">
                <input
                  type="checkbox"
                  checked={preferences.instant_invitation_received}
                  onChange={(e) =>
                    setPreferences({
                      ...preferences,
                      instant_invitation_received: e.target.checked,
                    })
                  }
                  disabled={!preferences.emails_enabled}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600 peer-disabled:opacity-50"></div>
              </label>
            </div>

            {/* Application status */}
            <div className="flex items-start justify-between py-3">
              <div className="flex-1">
                <h3 className="font-medium text-neutral-900">Statut de candidature</h3>
                <p className="text-sm text-neutral-600">
                  Quand ma candidature est acceptée ou refusée
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer ml-4">
                <input
                  type="checkbox"
                  checked={preferences.instant_application_status}
                  onChange={(e) =>
                    setPreferences({
                      ...preferences,
                      instant_application_status: e.target.checked,
                    })
                  }
                  disabled={!preferences.emails_enabled}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600 peer-disabled:opacity-50"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Digest Settings */}
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6 mb-6">
          <h2 className="text-xl font-semibold text-neutral-900 mb-4">
            📬 Résumé périodique
          </h2>
          <p className="text-sm text-neutral-600 mb-6">
            Recevoir un résumé regroupant vos recommandations de projets/talents
          </p>

          {/* Frequency */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-neutral-700 mb-3">
              Fréquence du résumé
            </label>
            <div className="space-y-2">
              {[
                { value: 'daily', label: 'Quotidien', desc: 'Un email par jour' },
                { value: 'weekly', label: 'Hebdomadaire', desc: 'Un email par semaine' },
                { value: 'never', label: 'Jamais', desc: 'Désactiver les résumés' },
              ].map((option) => (
                <label
                  key={option.value}
                  className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-colors ${
                    preferences.digest_frequency === option.value
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-neutral-200 hover:border-neutral-300'
                  } ${!preferences.emails_enabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <input
                    type="radio"
                    name="digest_frequency"
                    value={option.value}
                    checked={preferences.digest_frequency === option.value}
                    onChange={(e) =>
                      setPreferences({
                        ...preferences,
                        digest_frequency: e.target.value as any,
                      })
                    }
                    disabled={!preferences.emails_enabled}
                    className="w-4 h-4 text-primary-600 focus:ring-primary-500"
                  />
                  <div className="ml-3">
                    <div className="font-medium text-neutral-900">{option.label}</div>
                    <div className="text-sm text-neutral-600">{option.desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Include recommendations */}
          <div className="flex items-start justify-between py-3 border-t border-neutral-100 pt-4">
            <div className="flex-1">
              <h3 className="font-medium text-neutral-900">Inclure les recommandations</h3>
              <p className="text-sm text-neutral-600">
                Recevoir les projets/talents qui correspondent à votre profil
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer ml-4">
              <input
                type="checkbox"
                checked={preferences.recommendations_in_digest}
                onChange={(e) =>
                  setPreferences({
                    ...preferences,
                    recommendations_in_digest: e.target.checked,
                  })
                }
                disabled={!preferences.emails_enabled || preferences.digest_frequency === 'never'}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600 peer-disabled:opacity-50"></div>
            </label>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 mb-6">
          <div className="flex gap-3">
            <svg
              className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
            <div className="text-sm text-neutral-700">
              <p className="font-medium mb-1">💡 Conseil</p>
              <p>
                Les notifications instantanées vous permettent de réagir rapidement aux opportunités.
                Les résumés périodiques évitent la surcharge d'emails tout en vous tenant informé.
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1"
          >
            {isSaving ? 'Enregistrement...' : '💾 Enregistrer les préférences'}
          </Button>
        </div>
      </div>
    </div>
  );
}
