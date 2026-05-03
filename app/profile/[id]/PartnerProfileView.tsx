import Link from 'next/link';
import Navigation from '@/components/Navigation';
import { getOrgTypeLabel, REGIONS_FRANCE, DEPARTMENTS_FRANCE } from '@/lib/constants/france-geo';

const INTERVENTION_CATEGORY_LABELS: Record<string, string> = {
  agriculture:   'Agriculture / Agroalimentaire',
  mobility:      'Mobilité / Transport',
  industry:      'Industrie / Manufacturing',
  tech:          'Tech / Digital',
  health:        'Santé / Bien-être',
  education:     'Éducation / Formation',
  real_estate:   'Immobilier / Construction',
  environment:   'Environnement / Écologie',
  culture:       'Culture / Créatif',
  services:      'Services / Consulting',
  commerce:      'Commerce / Retail',
  hospitality:   'Restauration / Hôtellerie',
  finance:       'Finance / Fintech',
  energy:        'Énergie',
  entertainment: 'Divertissement / Loisirs',
  social:        'Social / Solidaire',
};

const TERRITORY_SCOPE_LABELS: Record<string, string> = {
  national:     'National',
  regional:     'Régional',
  departmental: 'Départemental',
};

type PartnerOrg = {
  organization_name: string;
  organization_type: string;
  organization_subtype: string | null;
  siret: string | null;
  territory_scope: string | null;
  territory_codes: string[] | null;
  intervention_categories: string[] | null;
  is_validated: boolean;
};

export default function PartnerProfileView({
  profileId,
  firstName,
  lastName,
  isOwnProfile,
  org,
}: {
  profileId: string;
  firstName: string;
  lastName: string;
  isOwnProfile: boolean;
  org: PartnerOrg | null;
}) {
  const territoryNames = (() => {
    if (!org?.territory_scope || org.territory_scope === 'national') return [];
    const codes = org.territory_codes ?? [];
    if (org.territory_scope === 'regional') {
      return codes.map((c) => REGIONS_FRANCE.find((r) => r.code === c)?.name ?? c);
    }
    return codes.map((c) => DEPARTMENTS_FRANCE.find((d) => d.code === c)?.name ?? c);
  })();

  const interventionCats = org?.intervention_categories ?? [];

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navigation />

      <div className="max-w-2xl mx-auto px-4 py-10">

        {/* Header card */}
        <div className="bg-white rounded-xl border border-neutral-200 p-6 mb-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-400 to-primary-700 flex items-center justify-center text-white text-2xl font-bold shrink-0">
                {firstName[0]}{lastName[0]}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-neutral-900">
                  {firstName} {lastName}
                </h1>
                <span className="inline-block mt-1 px-3 py-0.5 bg-primary-100 text-primary-700 text-sm font-medium rounded-full">
                  Partenaire
                </span>
                {org && (
                  <p className="text-neutral-600 mt-2 font-medium">{org.organization_name}</p>
                )}
              </div>
            </div>

            {isOwnProfile && (
              <div className="flex flex-col gap-2 shrink-0">
                <Link
                  href="/partenaires/dashboard"
                  className="text-sm font-medium px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-center"
                >
                  Dashboard
                </Link>
                <Link
                  href="/partenaires/profil/edit"
                  className="text-sm font-medium px-4 py-2 border border-neutral-300 text-neutral-700 rounded-lg hover:border-neutral-400 hover:bg-neutral-50 transition-colors text-center"
                >
                  Modifier
                </Link>
              </div>
            )}
          </div>
        </div>

        {!org ? (
          <div className="bg-white rounded-xl border border-neutral-200 p-6 text-neutral-500 text-sm">
            Informations de l&apos;organisation non disponibles.
          </div>
        ) : (
          <>
            {/* Organisation info */}
            <div className="bg-white rounded-xl border border-neutral-200 p-6 mb-5 space-y-3 text-sm">
              <h2 className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-4">
                Organisation
              </h2>

              <div className="flex gap-4">
                <span className="text-neutral-500 w-44 shrink-0">Type</span>
                <span className="text-neutral-800 font-medium">{getOrgTypeLabel(org.organization_type)}</span>
              </div>

              {org.organization_subtype && (
                <div className="flex gap-4">
                  <span className="text-neutral-500 w-44 shrink-0">Sous-catégorie</span>
                  <span className="text-neutral-800">{org.organization_subtype}</span>
                </div>
              )}

              {isOwnProfile && org.siret && (
                <div className="flex gap-4">
                  <span className="text-neutral-500 w-44 shrink-0">SIRET</span>
                  <span className="text-neutral-800 font-mono">{org.siret}</span>
                </div>
              )}

              <div className="flex gap-4">
                <span className="text-neutral-500 w-44 shrink-0">Périmètre</span>
                <div>
                  <span className="text-neutral-800">
                    {TERRITORY_SCOPE_LABELS[org.territory_scope ?? 'national'] ?? org.territory_scope}
                  </span>
                  {territoryNames.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {territoryNames.map((name) => (
                        <span
                          key={name}
                          className="text-xs px-2 py-0.5 bg-neutral-100 text-neutral-600 rounded-full"
                        >
                          {name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Intervention categories */}
            {interventionCats.length > 0 && (
              <div className="bg-white rounded-xl border border-neutral-200 p-6 space-y-3">
                <h2 className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-4">
                  Domaines d&apos;intervention
                </h2>
                <div className="flex flex-wrap gap-2">
                  {interventionCats.map((cat) => (
                    <span
                      key={cat}
                      className="text-sm font-medium px-3 py-1 bg-primary-50 text-primary-700 rounded-full"
                    >
                      {INTERVENTION_CATEGORY_LABELS[cat] ?? cat}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Own profile — CTA to dashboard */}
        {isOwnProfile && (
          <div className="mt-5 bg-primary-50 border border-primary-200 rounded-xl p-5">
            <p className="text-sm text-neutral-700 mb-3">
              Ceci est votre profil public partenaire. Accédez à votre espace pour gérer vos
              préférences et consulter les profils entrepreneurs et talents.
            </p>
            <Link
              href="/partenaires/dashboard"
              className="text-sm font-semibold text-primary-700 hover:text-primary-900 transition-colors"
            >
              Accéder à l&apos;espace partenaire →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
