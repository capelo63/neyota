'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

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

export default function InterventionCategoriesForm({ organizationName }: { organizationName: string }) {
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function toggle(code: string) {
    setSelected((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
    setError(null);
  }

  async function handleSubmit() {
    if (selected.length === 0) {
      setError('Sélectionnez au moins un domaine d\'intervention.');
      return;
    }
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/partenaires/intervention-categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ interventionCategories: selected }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Une erreur est survenue.');
        setIsSubmitting(false);
        return;
      }

      // Refresh server component cache so the dashboard re-fetches org data
      router.refresh();
      router.push('/partenaires/dashboard');
    } catch {
      setError('Une erreur réseau est survenue. Veuillez réessayer.');
      setIsSubmitting(false);
    }
  }

  return (
    <main className="max-w-xl mx-auto px-4 py-12">
      <div className="inline-flex items-center gap-2 bg-primary-50 text-primary-700 text-xs font-medium px-3 py-1 rounded-full mb-4">
        Espace partenaire
      </div>
      <h1 className="text-2xl font-bold text-neutral-900 mb-1">{organizationName}</h1>
      <p className="text-sm text-neutral-500 mb-8">
        Une dernière étape avant d'accéder à votre espace : indiquez les domaines dans lesquels vous intervenez.
      </p>

      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
        <h2 className="text-base font-semibold text-neutral-900 mb-1">Domaines d'intervention</h2>
        <p className="text-sm text-neutral-500 mb-4">
          Sélectionnez les secteurs dans lesquels votre organisation accompagne des porteurs de projet ou des talents.
        </p>

        <div className="max-h-80 overflow-y-auto border border-neutral-200 rounded-lg divide-y divide-neutral-100 mb-4">
          {INTERVENTION_CATEGORY_OPTIONS.map((item) => (
            <label
              key={item.code}
              className="flex items-center gap-3 px-3 py-2.5 hover:bg-neutral-50 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={selected.includes(item.code)}
                onChange={() => toggle(item.code)}
                className="w-4 h-4 accent-primary-600 shrink-0"
              />
              <span className="text-sm text-neutral-800">{item.name}</span>
            </label>
          ))}
        </div>

        {selected.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {selected.map((code) => {
              const label = INTERVENTION_CATEGORY_OPTIONS.find((o) => o.code === code)?.name ?? code;
              return (
                <span key={code} className="text-xs font-medium px-2.5 py-1 bg-primary-50 text-primary-700 rounded-full">
                  {label}
                </span>
              );
            })}
          </div>
        )}

        {error && (
          <p className="text-sm text-error-600 mb-4">{error}</p>
        )}

        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full bg-primary-600 hover:bg-primary-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-medium px-6 py-2.5 rounded-lg text-sm transition-colors"
        >
          {isSubmitting ? 'Enregistrement…' : 'Accéder à mon espace partenaire →'}
        </button>
      </div>
    </main>
  );
}
