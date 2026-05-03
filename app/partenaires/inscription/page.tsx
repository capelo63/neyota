'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import Link from 'next/link';
import Navigation from '@/components/Navigation';
import { PARTNER_ORG_TYPES, REGIONS_FRANCE, DEPARTMENTS_FRANCE, getOrgTypeLabel } from '@/lib/constants/france-geo';

type Step = 'A' | 'B' | 'D' | 'C';

const STEP_ORDER: Record<Step, number> = { A: 0, B: 1, D: 2, C: 3 };

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  organizationName: string;
  siret: string;
  organizationType: string;
  organizationSubtype: string;
  territoryScope: 'national' | 'regional' | 'departmental' | '';
  territoryCodes: string[];
  justificationUrl: string;
  interventionCategories: string[];
  cgaAccepted: boolean;
}

const INITIAL: FormData = {
  firstName: '', lastName: '', email: '', password: '',
  organizationName: '', siret: '', organizationType: '',
  organizationSubtype: '', territoryScope: '', territoryCodes: [],
  justificationUrl: '', interventionCategories: [], cgaAccepted: false,
};

const INTERVENTION_CATEGORY_OPTIONS = [
  { code: 'agriculture',   name: 'Agriculture / Agroalimentaire' },
  { code: 'mobility',      name: 'Mobilité / Transport' },
  { code: 'industry',      name: 'Industrie / Manufacturing' },
  { code: 'tech',          name: 'Tech / Digital' },
  { code: 'health',        name: 'Santé / Bien-être' },
  { code: 'education',     name: 'Éducation / Formation' },
  { code: 'real_estate',   name: 'Immobilier / Construction' },
  { code: 'environment',   name: 'Environnement / Écologie' },
  { code: 'culture',       name: 'Culture / Créatif' },
  { code: 'services',      name: 'Services / Consulting' },
  { code: 'commerce',      name: 'Commerce / Retail' },
  { code: 'hospitality',   name: 'Restauration / Hôtellerie' },
  { code: 'finance',       name: 'Finance / Fintech' },
  { code: 'energy',        name: 'Énergie' },
  { code: 'entertainment', name: 'Divertissement / Loisirs' },
  { code: 'social',        name: 'Social / Solidaire' },
] as const;

const INTERVENTION_CATEGORY_LABELS: Record<string, string> = Object.fromEntries(
  INTERVENTION_CATEGORY_OPTIONS.map((o) => [o.code, o.name])
);

function FieldError({ msg }: { msg?: string }) {
  return msg ? <p className="text-xs text-error-600 mt-1">{msg}</p> : null;
}

function Input({ label, required, error, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string; required?: boolean; error?: string }) {
  return (
    <div>
      <label className="block text-sm font-medium text-neutral-700 mb-1">
        {label}{required && <span className="text-error-500 ml-0.5">*</span>}
      </label>
      <input
        {...props}
        className={`w-full px-3 py-2.5 border rounded-lg text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary-300 ${
          error ? 'border-error-400 bg-error-50' : 'border-neutral-300 bg-white hover:border-neutral-400'
        }`}
      />
      <FieldError msg={error} />
    </div>
  );
}

function MultiCheckList({
  items, selected, onChange, maxH = 'max-h-48',
}: {
  items: readonly { code: string; name: string }[];
  selected: string[];
  onChange: (codes: string[]) => void;
  maxH?: string;
}) {
  const toggle = (code: string) =>
    onChange(selected.includes(code) ? selected.filter((c) => c !== code) : [...selected, code]);
  return (
    <div className={`${maxH} overflow-y-auto border border-neutral-200 rounded-lg divide-y divide-neutral-100`}>
      {items.map((item) => (
        <label key={item.code} className="flex items-center gap-3 px-3 py-2 hover:bg-neutral-50 cursor-pointer">
          <input
            type="checkbox"
            checked={selected.includes(item.code)}
            onChange={() => toggle(item.code)}
            className="w-4 h-4 accent-primary-600"
          />
          <span className="text-sm text-neutral-800">
            <span className="text-neutral-400 mr-1.5">{item.code}</span>{item.name}
          </span>
        </label>
      ))}
    </div>
  );
}

export default function PartenaireInscriptionPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('A');
  const [form, setForm] = useState<FormData>(INITIAL);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData | 'general', string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const set = (k: keyof FormData, v: unknown) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: undefined }));
  };

  const validateA = () => {
    const e: typeof errors = {};
    if (!form.firstName.trim()) e.firstName = 'Requis';
    if (!form.lastName.trim()) e.lastName = 'Requis';
    if (!form.email.trim()) e.email = 'Requis';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Email invalide';
    if (!form.password) e.password = 'Requis';
    else if (form.password.length < 8) e.password = 'Minimum 8 caractères';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateB = () => {
    const e: typeof errors = {};
    if (!form.organizationName.trim()) e.organizationName = 'Requis';
    if (!form.siret.trim()) e.siret = 'Requis';
    else if (!/^\d{14}$/.test(form.siret.replace(/\s/g, ''))) e.siret = '14 chiffres exacts';
    if (!form.organizationType) e.organizationType = 'Requis';
    if (!form.organizationSubtype.trim()) e.organizationSubtype = 'Requis';
    if (!form.territoryScope) e.territoryScope = 'Requis';
    if ((form.territoryScope === 'regional' || form.territoryScope === 'departmental') && form.territoryCodes.length === 0)
      e.territoryCodes = 'Sélectionnez au moins un territoire';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateD = () => {
    const e: typeof errors = {};
    if (form.interventionCategories.length === 0)
      e.interventionCategories = 'Sélectionnez au moins un domaine d\'intervention';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    if (step === 'A' && validateA()) setStep('B');
    if (step === 'B' && validateB()) setStep('D');
    if (step === 'D' && validateD()) setStep('C');
  };

  const handleSubmit = async () => {
    if (!form.cgaAccepted) {
      setErrors({ cgaAccepted: 'Vous devez accepter les conditions générales' });
      return;
    }
    setIsSubmitting(true);
    setErrors({});

    try {
      const res = await fetch('/api/partenaires/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          password: form.password,
          organizationName: form.organizationName,
          siret: form.siret.replace(/\s/g, ''),
          organizationType: form.organizationType,
          organizationSubtype: form.organizationSubtype,
          territoryScope: form.territoryScope,
          territoryCodes: form.territoryCodes,
          justificationUrl: form.justificationUrl || null,
          interventionCategories: form.interventionCategories,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrors({ general: data.error || 'Une erreur est survenue. Veuillez réessayer.' });
        setIsSubmitting(false);
        return;
      }

      // Sign in the newly created account
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: form.email,
        password: form.password,
      });

      if (signInError) {
        // Account created but sign-in failed — redirect anyway
        router.push('/login?message=compte-cree');
        return;
      }

      router.push('/partenaires/en-attente');
    } catch {
      setErrors({ general: 'Une erreur réseau est survenue. Veuillez réessayer.' });
      setIsSubmitting(false);
    }
  };

  const steps: { key: Step; label: string }[] = [
    { key: 'A', label: 'Contact' },
    { key: 'B', label: 'Organisation' },
    { key: 'D', label: 'Domaines' },
    { key: 'C', label: 'Validation' },
  ];

  const prevStep = (): Step => {
    if (step === 'C') return 'D';
    if (step === 'D') return 'B';
    return 'A';
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navigation />

      <div className="max-w-xl mx-auto px-4 py-10">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 mb-8 text-sm text-neutral-500">
          <Link href="/partenaires" className="hover:text-neutral-800 transition-colors">Partenaires</Link>
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-neutral-900 font-medium">Inscription</span>
        </nav>

        <h1 className="text-2xl font-bold text-neutral-900 mb-2">Devenir partenaire Teriis</h1>
        <p className="text-sm text-neutral-500 mb-8">Votre demande sera examinée sous 48 h ouvrées.</p>

        {/* Stepper */}
        <div className="flex items-center gap-0 mb-8">
          {steps.map((s, i) => (
            <div key={s.key} className="flex items-center flex-1">
              <div className={`flex items-center gap-2 ${i > 0 ? 'flex-1' : ''}`}>
                {i > 0 && (
                  <div className={`flex-1 h-px ${STEP_ORDER[step] >= STEP_ORDER[s.key] ? 'bg-primary-400' : 'bg-neutral-200'}`} />
                )}
                <div className={`flex items-center gap-1.5 shrink-0`}>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                    step === s.key
                      ? 'bg-primary-600 text-white'
                      : STEP_ORDER[step] > STEP_ORDER[s.key]
                      ? 'bg-primary-100 text-primary-700'
                      : 'bg-neutral-200 text-neutral-500'
                  }`}>
                    {i + 1}
                  </div>
                  <span className={`text-xs font-medium hidden sm:inline ${
                    step === s.key ? 'text-primary-700' : 'text-neutral-400'
                  }`}>
                    {s.label}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Error général */}
        {errors.general && (
          <div className="mb-6 p-4 bg-error-50 border border-error-200 text-error-700 rounded-lg text-sm">
            {errors.general}
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">

          {/* ── Étape A : Contact ── */}
          {step === 'A' && (
            <div className="space-y-4">
              <h2 className="text-base font-semibold text-neutral-900 mb-4">Informations de contact</h2>
              <div className="grid grid-cols-2 gap-4">
                <Input label="Prénom" required value={form.firstName} onChange={(e) => set('firstName', e.target.value)} error={errors.firstName} autoComplete="given-name" />
                <Input label="Nom" required value={form.lastName} onChange={(e) => set('lastName', e.target.value)} error={errors.lastName} autoComplete="family-name" />
              </div>
              <Input label="Email professionnel" required type="email" value={form.email} onChange={(e) => set('email', e.target.value)} error={errors.email} autoComplete="email" />
              <Input label="Mot de passe" required type="password" value={form.password} onChange={(e) => set('password', e.target.value)} error={errors.password} autoComplete="new-password" placeholder="8 caractères minimum" />
            </div>
          )}

          {/* ── Étape B : Organisation ── */}
          {step === 'B' && (
            <div className="space-y-5">
              <h2 className="text-base font-semibold text-neutral-900 mb-4">Informations sur l'organisation</h2>

              <Input label="Nom de l'organisation" required value={form.organizationName} onChange={(e) => set('organizationName', e.target.value)} error={errors.organizationName} />

              <Input label="Numéro SIRET" required value={form.siret} onChange={(e) => set('siret', e.target.value)} error={errors.siret} placeholder="14 chiffres" maxLength={14} inputMode="numeric" />

              {/* Type d'organisation */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Type d'organisation<span className="text-error-500 ml-0.5">*</span>
                </label>
                {PARTNER_ORG_TYPES.map((group) => (
                  <div key={group.group} className="mb-3">
                    <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-2">{group.groupLabel}</p>
                    <div className="space-y-1.5">
                      {group.items.map((item) => (
                        <label key={item.value} className={`flex items-center gap-3 p-2.5 rounded-lg border cursor-pointer transition-colors ${
                          form.organizationType === item.value
                            ? 'border-primary-400 bg-primary-50'
                            : 'border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50'
                        }`}>
                          <input
                            type="radio"
                            name="orgType"
                            value={item.value}
                            checked={form.organizationType === item.value}
                            onChange={() => set('organizationType', item.value)}
                            className="accent-primary-600"
                          />
                          <span className="text-sm text-neutral-800">{item.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
                <FieldError msg={errors.organizationType} />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Sous-catégorie précise<span className="text-error-500 ml-0.5">*</span>
                </label>
                <input
                  type="text"
                  value={form.organizationSubtype}
                  onChange={(e) => set('organizationSubtype', e.target.value)}
                  placeholder="Ex : Communauté de communes, Réseau Initiative France, BPI Hauts-de-France…"
                  className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-300 ${errors.organizationSubtype ? 'border-error-400 bg-error-50' : 'border-neutral-300'}`}
                />
                <FieldError msg={errors.organizationSubtype} />
              </div>

              {/* Territoire */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Territoire d'intervention<span className="text-error-500 ml-0.5">*</span>
                </label>
                <div className="space-y-2 mb-3">
                  {([['national', 'National'], ['regional', 'Régional'], ['departmental', 'Départemental']] as const).map(([val, lbl]) => (
                    <label key={val} className={`flex items-center gap-3 p-2.5 rounded-lg border cursor-pointer transition-colors ${
                      form.territoryScope === val ? 'border-primary-400 bg-primary-50' : 'border-neutral-200 hover:border-neutral-300'
                    }`}>
                      <input type="radio" name="territory" value={val} checked={form.territoryScope === val}
                        onChange={() => { set('territoryScope', val); set('territoryCodes', []); }}
                        className="accent-primary-600" />
                      <span className="text-sm text-neutral-800">{lbl}</span>
                    </label>
                  ))}
                </div>
                <FieldError msg={errors.territoryScope} />

                {form.territoryScope === 'regional' && (
                  <div>
                    <p className="text-xs text-neutral-500 mb-2">Sélectionnez les régions concernées</p>
                    <MultiCheckList items={REGIONS_FRANCE} selected={form.territoryCodes} onChange={(c) => set('territoryCodes', c)} maxH="max-h-52" />
                    <FieldError msg={errors.territoryCodes} />
                  </div>
                )}

                {form.territoryScope === 'departmental' && (
                  <div>
                    <p className="text-xs text-neutral-500 mb-2">Sélectionnez les départements concernés</p>
                    <MultiCheckList items={DEPARTMENTS_FRANCE} selected={form.territoryCodes} onChange={(c) => set('territoryCodes', c)} maxH="max-h-64" />
                    <FieldError msg={errors.territoryCodes} />
                  </div>
                )}
              </div>

              {/* Lien justificatif */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Lien justificatif <span className="text-neutral-400 font-normal">(optionnel)</span>
                </label>
                <input
                  type="url"
                  value={form.justificationUrl}
                  onChange={(e) => set('justificationUrl', e.target.value)}
                  placeholder="https://votre-organisation.fr"
                  className="w-full px-3 py-2.5 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
                />
                <p className="text-xs text-neutral-400 mt-1">Site institutionnel ou document de présentation</p>
              </div>
            </div>
          )}

          {/* ── Étape D : Domaines d'intervention ── */}
          {step === 'D' && (
            <div className="space-y-4">
              <h2 className="text-base font-semibold text-neutral-900 mb-1">Domaines d'intervention</h2>
              <p className="text-sm text-neutral-500 mb-4">
                Sélectionnez les domaines dans lesquels votre organisation accompagne des porteurs de projet ou des talents.
                Ces informations nous permettent de vous proposer des profils pertinents.
              </p>

              <div>
                <div className="max-h-80 overflow-y-auto border border-neutral-200 rounded-lg divide-y divide-neutral-100">
                  {INTERVENTION_CATEGORY_OPTIONS.map((item) => (
                    <label
                      key={item.code}
                      className="flex items-center gap-3 px-3 py-2.5 hover:bg-neutral-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={form.interventionCategories.includes(item.code)}
                        onChange={() => {
                          const cats = form.interventionCategories;
                          set(
                            'interventionCategories',
                            cats.includes(item.code)
                              ? cats.filter((c) => c !== item.code)
                              : [...cats, item.code]
                          );
                        }}
                        className="w-4 h-4 accent-primary-600 shrink-0"
                      />
                      <span className="text-sm text-neutral-800">{item.name}</span>
                    </label>
                  ))}
                </div>
                <FieldError msg={errors.interventionCategories} />
              </div>

              {form.interventionCategories.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {form.interventionCategories.map((code) => (
                    <span
                      key={code}
                      className="text-xs font-medium px-2.5 py-1 bg-primary-50 text-primary-700 rounded-full"
                    >
                      {INTERVENTION_CATEGORY_LABELS[code] ?? code}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── Étape C : Récapitulatif ── */}
          {step === 'C' && (
            <div className="space-y-5">
              <h2 className="text-base font-semibold text-neutral-900 mb-4">Récapitulatif de votre demande</h2>

              <div className="bg-neutral-50 rounded-lg border border-neutral-200 divide-y divide-neutral-100 text-sm">
                {([
                  ['Contact', `${form.firstName} ${form.lastName} — ${form.email}`],
                  ['Organisation', form.organizationName],
                  ['SIRET', form.siret],
                  ['Type', getOrgTypeLabel(form.organizationType)],
                  ['Sous-catégorie', form.organizationSubtype],
                  ['Territoire', form.territoryScope === 'national'
                    ? 'National'
                    : `${form.territoryScope === 'regional' ? 'Régional' : 'Départemental'} — ${form.territoryCodes.join(', ')}`],
                  ...(form.justificationUrl ? [['Lien justificatif', form.justificationUrl] as [string, string]] : []),
                  ['Domaines d\'intervention', form.interventionCategories.map((c) => INTERVENTION_CATEGORY_LABELS[c] ?? c).join(', ')],
                ] as [string, string][]).map(([label, value]) => (
                  <div key={label} className="px-4 py-3 flex gap-4">
                    <span className="text-neutral-500 w-36 shrink-0">{label}</span>
                    <span className="text-neutral-900 break-all">{value}</span>
                  </div>
                ))}
              </div>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.cgaAccepted}
                  onChange={(e) => set('cgaAccepted', e.target.checked)}
                  className="mt-0.5 w-4 h-4 accent-primary-600"
                />
                <span className="text-sm text-neutral-700">
                  J'accepte les{' '}
                  <Link href="/partenaires/charte" target="_blank" className="text-primary-600 underline underline-offset-2">
                    conditions générales partenaires
                  </Link>{' '}
                  de Teriis et m'engage à utiliser les données dans le respect des utilisateurs.
                </span>
              </label>
              <FieldError msg={errors.cgaAccepted} />
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-neutral-100">
            {step !== 'A' ? (
              <button
                type="button"
                onClick={() => setStep(prevStep())}
                className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors"
              >
                ← Précédent
              </button>
            ) : (
              <Link href="/partenaires" className="text-sm text-neutral-500 hover:text-neutral-800 transition-colors">
                Annuler
              </Link>
            )}

            {step !== 'C' ? (
              <button
                type="button"
                onClick={handleNext}
                className="bg-primary-600 hover:bg-primary-700 text-white font-medium px-6 py-2.5 rounded-lg text-sm transition-colors"
              >
                Suivant →
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="bg-primary-600 hover:bg-primary-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-medium px-6 py-2.5 rounded-lg text-sm transition-colors"
              >
                {isSubmitting ? 'Envoi en cours…' : 'Soumettre ma demande'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
