'use client';

import { useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import Link from 'next/link';

interface Criteria {
  isProfileComplete: boolean;
  hasProjectsOrSkills: boolean;
  isOldEnough: boolean;
  hasApplications: boolean;
}

interface VisibilitySettings {
  visible_to_support_partners: boolean;
  visible_to_commercial_partners: boolean;
}

interface Props {
  userId: string;
  role: 'entrepreneur' | 'talent';
  initialSettings: VisibilitySettings;
  criteria: Criteria;
}

function Toggle({
  checked,
  onChange,
  disabled = false,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <label className={`relative inline-flex items-center ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
        className="sr-only peer"
      />
      <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600 peer-disabled:opacity-40"></div>
    </label>
  );
}

function CriteriaRow({ label, met }: { label: string; met: boolean }) {
  return (
    <div className="flex items-center gap-3 py-2">
      {met ? (
        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-success-100 flex items-center justify-center">
          <svg className="w-3 h-3 text-success-600" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </span>
      ) : (
        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-neutral-100 flex items-center justify-center">
          <svg className="w-3 h-3 text-neutral-400" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </span>
      )}
      <span className={`text-sm ${met ? 'text-neutral-800' : 'text-neutral-500'}`}>{label}</span>
    </div>
  );
}

export default function PartnerVisibilityClient({ userId, role, initialSettings, criteria }: Props) {
  const [settings, setSettings] = useState<VisibilitySettings>(initialSettings);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const metCount = [
    criteria.isProfileComplete,
    criteria.hasProjectsOrSkills,
    criteria.isOldEnough,
    criteria.hasApplications,
  ].filter(Boolean).length;

  const contextMessage =
    metCount <= 2
      ? 'Votre profil est en cours de construction. Vous pouvez activer la visibilité dès maintenant, mais vous recevrez plus de propositions pertinentes lorsque votre profil sera plus complet.'
      : metCount === 3
      ? 'Votre profil progresse. Vous pouvez activer la visibilité si vous le souhaitez.'
      : 'Votre profil est dans un état propice à recevoir des propositions. À vous de choisir le moment opportun.';

  const save = async (next: VisibilitySettings) => {
    setSaveStatus('saving');
    const { error } = await supabase
      .from('partner_visibility_settings')
      .upsert({ user_id: userId, ...next, updated_at: new Date().toISOString() });
    if (error) {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } else {
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }
  };

  const handleSupportToggle = async (value: boolean) => {
    const next: VisibilitySettings = {
      visible_to_support_partners: value,
      visible_to_commercial_partners: value ? settings.visible_to_commercial_partners : false,
    };
    setSettings(next);
    await save(next);
  };

  const handleCommercialToggle = async (value: boolean) => {
    const next: VisibilitySettings = { ...settings, visible_to_commercial_partners: value };
    setSettings(next);
    await save(next);
  };

  const commercialBlocked = !settings.visible_to_support_partners;

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-2xl mx-auto px-4 py-8">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 mb-8 text-sm text-neutral-500">
          <Link href="/settings" className="hover:text-neutral-800 transition-colors">
            Paramètres
          </Link>
          <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-neutral-900 font-medium">Visibilité partenaires</span>
        </nav>

        {/* En-tête */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-neutral-900 mb-3">
            Visibilité auprès des partenaires
          </h1>
          <p className="text-neutral-600 leading-relaxed">
            Vous pouvez choisir d'être visible auprès des partenaires institutionnels
            (collectivités, incubateurs, financeurs publics) et/ou des partenaires commerciaux
            (consultants, investisseurs privés). Cette visibilité est entièrement à votre
            initiative et réversible à tout moment.
          </p>
        </div>

        {/* Indicateur de sauvegarde */}
        {saveStatus !== 'idle' && (
          <div className={`mb-6 px-4 py-2 rounded-lg text-sm ${
            saveStatus === 'saving' ? 'bg-neutral-100 text-neutral-600' :
            saveStatus === 'saved'  ? 'bg-success-50 border border-success-200 text-success-700' :
                                      'bg-error-50 border border-error-200 text-error-700'
          }`}>
            {saveStatus === 'saving' && 'Enregistrement…'}
            {saveStatus === 'saved'  && 'Préférences enregistrées.'}
            {saveStatus === 'error'  && "Erreur lors de l'enregistrement. Veuillez réessayer."}
          </div>
        )}

        {/* Bloc : État de votre profil */}
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6 mb-6">
          <h2 className="text-base font-semibold text-neutral-900 mb-1">État de votre profil</h2>
          <p className="text-sm text-neutral-500 mb-4">
            Ces indicateurs sont fournis à titre informatif. Ils n'influencent pas votre visibilité.
          </p>
          <div className="divide-y divide-neutral-100">
            <CriteriaRow label="Bio, photo et ville renseignées" met={criteria.isProfileComplete} />
            <CriteriaRow
              label={role === 'entrepreneur' ? 'Au moins un projet actif publié' : 'Au moins 3 compétences renseignées'}
              met={criteria.hasProjectsOrSkills}
            />
            <CriteriaRow label="Profil créé il y a plus de 30 jours" met={criteria.isOldEnough} />
            <CriteriaRow label="Au moins une candidature reçue ou émise" met={criteria.hasApplications} />
          </div>
          <div className="mt-5 pt-4 border-t border-neutral-100">
            <p className="text-sm text-neutral-600 leading-relaxed">{contextMessage}</p>
          </div>
        </div>

        {/* Bloc : Vos choix de visibilité */}
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 divide-y divide-neutral-100 mb-6">
          <div className="px-6 py-4">
            <h2 className="text-base font-semibold text-neutral-900">Vos choix de visibilité</h2>
          </div>

          {/* Toggle — partenaires institutionnels */}
          <div className="px-6 py-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <p className="text-sm font-semibold text-neutral-900 mb-1">
                  Partenaires institutionnels
                </p>
                <p className="text-sm text-neutral-500 leading-relaxed">
                  Collectivités territoriales, structures publiques d'accompagnement (BPI, ADEME…),
                  chambres consulaires (CCI, CMA…), réseaux d'accompagnement à but non lucratif,
                  incubateurs, accélérateurs et fondations.
                </p>
              </div>
              <div className="flex-shrink-0 mt-0.5">
                <Toggle checked={settings.visible_to_support_partners} onChange={handleSupportToggle} />
              </div>
            </div>
          </div>

          {/* Toggle — partenaires commerciaux */}
          <div className={`px-6 py-5 transition-opacity ${commercialBlocked ? 'opacity-50' : ''}`}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <p className="text-sm font-semibold text-neutral-900 mb-1">
                  Partenaires commerciaux
                </p>
                <p className="text-sm text-neutral-500 leading-relaxed">
                  Partenaires financiers privés (banques, fonds d'investissement), prestataires
                  de services et autres acteurs commerciaux.
                </p>
                {commercialBlocked && (
                  <p className="text-xs text-neutral-400 mt-2">
                    Activez d'abord la visibilité aux partenaires institutionnels pour autoriser les partenaires commerciaux.
                  </p>
                )}
              </div>
              <div className="flex-shrink-0 mt-0.5">
                <Toggle
                  checked={settings.visible_to_commercial_partners}
                  onChange={handleCommercialToggle}
                  disabled={commercialBlocked}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Mention réversibilité */}
        <p className="text-sm text-neutral-500 leading-relaxed">
          Vous pouvez désactiver votre visibilité à tout moment. Les partenaires en cours de
          discussion avec vous ne seront pas affectés par cette modification.
        </p>
      </div>
    </div>
  );
}
