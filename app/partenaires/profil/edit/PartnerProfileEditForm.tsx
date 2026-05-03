'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { REGIONS_FRANCE, DEPARTMENTS_FRANCE, getOrgTypeLabel } from '@/lib/constants/france-geo';

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

type OrgData = {
  organization_name: string;
  organization_type: string;
  organization_subtype: string | null;
  siret: string | null;
  territory_scope: string;
  territory_codes: string[];
  intervention_categories: string[];
};

function FieldError({ msg }: { msg?: string }) {
  return msg ? <p className="text-xs text-red-600 mt-1">{msg}</p> : null;
}

function MultiCheckList({
  items, selected, onChange, maxH = 'max-h-52',
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
            className="w-4 h-4 accent-primary-600 shrink-0"
          />
          <span className="text-sm text-neutral-800">{item.name}</span>
        </label>
      ))}
    </div>
  );
}

export default function PartnerProfileEditForm({ userId, org }: { userId: string; org: OrgData }) {
  const router = useRouter();

  const [organizationName, setOrganizationName]       = useState(org.organization_name);
  const [territoryScope, setTerritoryScope]           = useState<'national' | 'regional' | 'departmental'>(
    org.territory_scope as 'national' | 'regional' | 'departmental'
  );
  const [territoryCodes, setTerritoryCodes]           = useState<string[]>(org.territory_codes);
  const [interventionCategories, setInterventionCats] = useState<string[]>(org.intervention_categories);

  const [errors, setErrors]       = useState<Record<string, string>>({});
  const [isSubmitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg]   = useState('');

  function validate() {
    const e: Record<string, string> = {};
    if (!organizationName.trim()) e.organizationName = 'Requis';
    if ((territoryScope === 'regional' || territoryScope === 'departmental') && territoryCodes.length === 0)
      e.territoryCodes = 'Sélectionnez au moins un territoire';
    if (interventionCategories.length === 0)
      e.interventionCategories = 'Sélectionnez au moins un domaine';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    setSuccessMsg('');

    try {
      const res = await fetch('/api/partenaires/profil', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ organizationName, territoryScope, territoryCodes, interventionCategories }),
      });

      if (!res.ok) {
        const data = await res.json();
        setErrors({ general: data.error || 'Une erreur est survenue.' });
        return;
      }

      setSuccessMsg('Modifications enregistrées.');
      router.refresh();
      router.push(`/profile/${userId}`);
    } catch {
      setErrors({ general: 'Erreur réseau. Veuillez réessayer.' });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="max-w-xl mx-auto px-4 py-10">
      <nav className="flex items-center gap-2 mb-8 text-sm text-neutral-500">
        <Link href="/partenaires/dashboard" className="hover:text-neutral-800 transition-colors">Espace partenaire</Link>
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
        <span className="text-neutral-900 font-medium">Modifier mon profil</span>
      </nav>

      <h1 className="text-2xl font-bold text-neutral-900 mb-2">Modifier mon profil partenaire</h1>
      <p className="text-sm text-neutral-500 mb-8">
        Le type d&apos;organisation et le SIRET ne peuvent pas être modifiés ici (contactez l&apos;équipe Teriis si nécessaire).
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Read-only fields */}
        <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-5 space-y-3 text-sm">
          <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-3">Informations non modifiables</p>
          <div className="flex gap-4">
            <span className="text-neutral-500 w-40 shrink-0">Type</span>
            <span className="text-neutral-800 font-medium">{getOrgTypeLabel(org.organization_type)}</span>
          </div>
          {org.organization_subtype && (
            <div className="flex gap-4">
              <span className="text-neutral-500 w-40 shrink-0">Sous-catégorie</span>
              <span className="text-neutral-800">{org.organization_subtype}</span>
            </div>
          )}
          {org.siret && (
            <div className="flex gap-4">
              <span className="text-neutral-500 w-40 shrink-0">SIRET</span>
              <span className="text-neutral-800 font-mono">{org.siret}</span>
            </div>
          )}
        </div>

        {errors.general && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {errors.general}
          </div>
        )}
        {successMsg && (
          <div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">
            {successMsg}
          </div>
        )}

        {/* Organisation name */}
        <div className="bg-white rounded-xl border border-neutral-200 p-5 space-y-4">
          <h2 className="text-sm font-semibold text-neutral-900">Nom de l&apos;organisation</h2>
          <div>
            <input
              type="text"
              value={organizationName}
              onChange={(e) => { setOrganizationName(e.target.value); setErrors((prev) => ({ ...prev, organizationName: '' })); }}
              className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-300 ${errors.organizationName ? 'border-red-400 bg-red-50' : 'border-neutral-300'}`}
            />
            <FieldError msg={errors.organizationName} />
          </div>
        </div>

        {/* Territory */}
        <div className="bg-white rounded-xl border border-neutral-200 p-5 space-y-4">
          <h2 className="text-sm font-semibold text-neutral-900">Périmètre d&apos;intervention</h2>
          <div className="space-y-2">
            {(['national', 'regional', 'departmental'] as const).map((val) => (
              <label key={val} className={`flex items-center gap-3 p-2.5 rounded-lg border cursor-pointer transition-colors ${
                territoryScope === val ? 'border-primary-400 bg-primary-50' : 'border-neutral-200 hover:border-neutral-300'
              }`}>
                <input
                  type="radio"
                  name="territory"
                  value={val}
                  checked={territoryScope === val}
                  onChange={() => { setTerritoryScope(val); setTerritoryCodes([]); setErrors((p) => ({ ...p, territoryCodes: '' })); }}
                  className="accent-primary-600"
                />
                <span className="text-sm text-neutral-800 capitalize">
                  {val === 'national' ? 'National' : val === 'regional' ? 'Régional' : 'Départemental'}
                </span>
              </label>
            ))}
          </div>

          {territoryScope === 'regional' && (
            <div>
              <p className="text-xs text-neutral-500 mb-2">Régions concernées</p>
              <MultiCheckList
                items={REGIONS_FRANCE}
                selected={territoryCodes}
                onChange={(c) => { setTerritoryCodes(c); setErrors((p) => ({ ...p, territoryCodes: '' })); }}
                maxH="max-h-52"
              />
              <FieldError msg={errors.territoryCodes} />
            </div>
          )}

          {territoryScope === 'departmental' && (
            <div>
              <p className="text-xs text-neutral-500 mb-2">Départements concernés</p>
              <MultiCheckList
                items={DEPARTMENTS_FRANCE}
                selected={territoryCodes}
                onChange={(c) => { setTerritoryCodes(c); setErrors((p) => ({ ...p, territoryCodes: '' })); }}
                maxH="max-h-64"
              />
              <FieldError msg={errors.territoryCodes} />
            </div>
          )}
        </div>

        {/* Intervention categories */}
        <div className="bg-white rounded-xl border border-neutral-200 p-5 space-y-4">
          <h2 className="text-sm font-semibold text-neutral-900">Domaines d&apos;intervention</h2>
          <MultiCheckList
            items={INTERVENTION_CATEGORY_OPTIONS}
            selected={interventionCategories}
            onChange={(c) => { setInterventionCats(c); setErrors((p) => ({ ...p, interventionCategories: '' })); }}
            maxH="max-h-72"
          />
          <FieldError msg={errors.interventionCategories} />
          {interventionCategories.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {interventionCategories.map((code) => {
                const label = INTERVENTION_CATEGORY_OPTIONS.find((o) => o.code === code)?.name ?? code;
                return (
                  <span key={code} className="text-xs font-medium px-2.5 py-1 bg-primary-50 text-primary-700 rounded-full">
                    {label}
                  </span>
                );
              })}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-2">
          <Link href={`/profile/${userId}`} className="text-sm text-neutral-500 hover:text-neutral-800 transition-colors">
            ← Annuler
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-primary-600 hover:bg-primary-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-medium px-6 py-2.5 rounded-lg text-sm transition-colors"
          >
            {isSubmitting ? 'Enregistrement…' : 'Enregistrer les modifications'}
          </button>
        </div>
      </form>
    </main>
  );
}
