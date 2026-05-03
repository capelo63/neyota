'use client';

import Link from 'next/link';
import { REGIONS_FRANCE, DEPARTMENTS_FRANCE, getOrgTypeLabel } from '@/lib/constants/france-geo';
import type { PartnerOrg } from '../page';

// ── Types ────────────────────────────────────────────────────────────────────

type ViewDay     = { day: string; count: number };
type RecentView  = {
  profile_id: string;
  first_name: string;
  last_name: string;
  city: string;
  role: string;
  avatar_url: string | null;
  viewed_at: string;
};
type TopCategory = { category: string; count: number };

export type AnalyticsData = {
  total_views:            number;
  unique_profiles_viewed: number;
  favorites_count:        number;
  visible_profiles_count: number;
  views_by_day:                 ViewDay[]     | null;
  recent_views:                 RecentView[]  | null;
  top_categories:               TopCategory[] | null;
  intervention_category_counts: TopCategory[] | null;
};

// ── Constants ─────────────────────────────────────────────────────────────────

const CATEGORY_LABELS: Record<string, string> = {
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

// ── Helpers ───────────────────────────────────────────────────────────────────

function scopeLabel(org: PartnerOrg): string {
  if (!org.territory_scope || org.territory_scope === 'national') return 'National';
  const codes = org.territory_codes ?? [];
  if (org.territory_scope === 'regional') {
    const names = codes.map((c) => REGIONS_FRANCE.find((r) => r.code === c)?.name ?? c);
    return `Régional — ${names.join(', ')}`;
  }
  const names = codes.map((c) => DEPARTMENTS_FRANCE.find((d) => d.code === c)?.name ?? c);
  return `Départemental — ${names.join(', ')}`;
}

function initials(first: string, last: string): string {
  return `${first[0] ?? ''}${last[0] ?? ''}`.toUpperCase();
}

function formatDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric', month: 'short', year: 'numeric',
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

// ── Sub-components ────────────────────────────────────────────────────────────

function ViewsBarChart({ data }: { data: ViewDay[] }) {
  const maxCount = Math.max(...data.map((d) => d.count), 1);
  return (
    <div>
      <div className="flex items-end gap-px" style={{ height: 112 }}>
        {data.map((d) => {
          const pct = (d.count / maxCount) * 100;
          const [, mm, dd] = d.day.split('-');
          return (
            <div
              key={d.day}
              className="flex-1 flex flex-col justify-end"
              title={`${parseInt(dd)}/${parseInt(mm)}: ${d.count} vue${d.count !== 1 ? 's' : ''}`}
            >
              <div
                className={`w-full rounded-t-sm transition-all ${
                  d.count > 0 ? 'bg-primary-500' : 'bg-neutral-100'
                }`}
                style={{ height: `${Math.max(pct, d.count > 0 ? 5 : 1)}%` }}
              />
            </div>
          );
        })}
      </div>
      <div className="flex gap-px mt-1.5">
        {data.map((d, i) => {
          const [, mm, dd] = d.day.split('-');
          const dayNum = parseInt(dd);
          const showLabel = i === 0 || i === data.length - 1 || dayNum === 1 || i % 7 === 0;
          return (
            <div key={d.day} className="flex-1 text-center overflow-hidden">
              {showLabel && (
                <span className="text-[9px] text-neutral-400 leading-none">
                  {dayNum}/{parseInt(mm)}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StatCard({
  value,
  label,
  colorClass,
  icon,
}: {
  value: number;
  label: string;
  colorClass: string;
  icon: string;
}) {
  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-4">
      <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl text-xl mb-3 ${colorClass}`}>
        {icon}
      </div>
      <p className="text-2xl font-bold text-neutral-900">{value.toLocaleString('fr-FR')}</p>
      <p className="text-xs text-neutral-500 mt-0.5 leading-snug">{label}</p>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function AnalyticsDashboard({
  org,
  analytics,
}: {
  org: PartnerOrg;
  analytics: AnalyticsData;
}) {
  const days           = analytics.views_by_day               ?? [];
  const recentViews    = analytics.recent_views               ?? [];
  const topCats        = analytics.top_categories             ?? [];
  const interventionCounts = analytics.intervention_category_counts ?? [];
  const maxCatCount    = Math.max(...topCats.map((c) => c.count), 1);
  const maxInterventionCount = Math.max(...interventionCounts.map((c) => c.count), 1);
  const totalDayViews  = days.reduce((s, d) => s + d.count, 0);

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">

      {/* ── Header ── */}
      <div className="mb-4">
        <div className="inline-flex items-center gap-2 bg-primary-50 text-primary-700 text-xs font-medium px-3 py-1 rounded-full mb-3">
          Espace partenaire
        </div>
        <h1 className="text-2xl font-bold text-neutral-900">{org.organization_name}</h1>
        <p className="text-sm text-neutral-500 mt-1">
          {getOrgTypeLabel(org.organization_type)} · {scopeLabel(org)}
        </p>
      </div>

      {/* ── Navigation tabs ── */}
      <div className="flex gap-1 mb-6 border-b border-neutral-200">
        <Link
          href="/partenaires/dashboard"
          className="px-4 py-2.5 text-sm font-medium text-neutral-500 hover:text-neutral-700 transition-colors"
        >
          Annuaire
        </Link>
        <span className="px-4 py-2.5 text-sm font-medium text-primary-600 border-b-2 border-primary-600">
          Statistiques
        </span>
      </div>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          value={analytics.total_views}
          label="Consultations effectuées"
          icon="👁️"
          colorClass="bg-blue-50 text-blue-600"
        />
        <StatCard
          value={analytics.unique_profiles_viewed}
          label="Profils uniques consultés"
          icon="👥"
          colorClass="bg-purple-50 text-purple-600"
        />
        <StatCard
          value={analytics.favorites_count}
          label="Profils en favoris"
          icon="⭐"
          colorClass="bg-yellow-50 text-yellow-600"
        />
        <StatCard
          value={analytics.visible_profiles_count}
          label="Profils visibles dans votre périmètre"
          icon="🗺️"
          colorClass="bg-green-50 text-green-600"
        />
      </div>

      {/* ── Main grid : chart + categories ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">

        {/* Daily views chart */}
        <div className="lg:col-span-2 bg-white border border-neutral-200 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-neutral-700">
              Consultations — 30 derniers jours
            </h2>
            <span className="text-xs text-neutral-400 font-medium">
              {totalDayViews} au total
            </span>
          </div>
          {days.length > 0 ? (
            <ViewsBarChart data={days} />
          ) : (
            <p className="text-sm text-neutral-400 text-center py-10">
              Aucune consultation enregistrée sur cette période.
            </p>
          )}
        </div>

        {/* Top categories */}
        <div className="bg-white border border-neutral-200 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-neutral-700 mb-4">
            Thématiques les plus présentes dans votre périmètre
          </h2>
          {topCats.length > 0 ? (
            <div className="flex flex-col gap-3.5">
              {topCats.map((c, i) => (
                <div key={c.category}>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="flex items-center gap-1.5 font-medium text-neutral-700">
                      <span className="text-neutral-400 font-normal">#{i + 1}</span>
                      {CATEGORY_LABELS[c.category] ?? c.category}
                    </span>
                    <span className="text-neutral-400 shrink-0 ml-2">
                      {c.count} projet{c.count !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary-500 rounded-full"
                      style={{ width: `${(c.count / maxCatCount) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-neutral-400 text-center py-8">
              Aucun projet actif dans votre périmètre.
            </p>
          )}
        </div>
      </div>

      {/* ── Intervention domains with project counts ── */}
      {interventionCounts.length > 0 && (
        <div className="bg-white border border-neutral-200 rounded-xl p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-neutral-700">
              Projets actifs dans vos domaines d&apos;intervention
            </h2>
            <span className="text-xs text-neutral-400 font-medium">
              {interventionCounts.reduce((s, c) => s + c.count, 0)} projets au total
            </span>
          </div>
          <div className="flex flex-col gap-3.5">
            {interventionCounts.map((c) => (
              <div key={c.category}>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-medium text-neutral-700">
                    {CATEGORY_LABELS[c.category] ?? c.category}
                  </span>
                  <span className="text-neutral-400 shrink-0 ml-2">
                    {c.count} projet{c.count !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${c.count > 0 ? 'bg-primary-500' : 'bg-neutral-200'}`}
                    style={{ width: c.count > 0 ? `${(c.count / maxInterventionCount) * 100}%` : '4px' }}
                  />
                </div>
              </div>
            ))}
          </div>
          {interventionCounts.every((c) => c.count === 0) && (
            <p className="text-xs text-neutral-400 mt-3 text-center">
              Aucun projet actif ne correspond encore à vos domaines dans votre périmètre.
            </p>
          )}
        </div>
      )}

      {/* ── Recent views ── */}
      <div className="bg-white border border-neutral-200 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-neutral-700 mb-4">
          10 derniers profils consultés
        </h2>
        {recentViews.length > 0 ? (
          <div className="divide-y divide-neutral-100">
            {recentViews.map((v) => (
              <div key={v.profile_id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                {v.avatar_url ? (
                  <img
                    src={v.avatar_url}
                    alt=""
                    className="w-9 h-9 rounded-full object-cover shrink-0"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-neutral-100 flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-neutral-500">
                      {initials(v.first_name, v.last_name)}
                    </span>
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-neutral-900 truncate">
                    {v.first_name} {v.last_name}
                  </p>
                  <p className="text-xs text-neutral-400 truncate">{v.city}</p>
                </div>

                <span className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${
                  v.role === 'entrepreneur'
                    ? 'bg-orange-50 text-orange-700'
                    : 'bg-green-50 text-green-700'
                }`}>
                  {v.role === 'entrepreneur' ? 'Porteur' : 'Talent'}
                </span>

                <div className="text-right shrink-0 min-w-[90px]">
                  <p className="text-xs text-neutral-400">{formatDate(v.viewed_at)}</p>
                  <Link
                    href={`/profile/${v.profile_id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary-600 hover:underline"
                  >
                    Voir le profil →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-neutral-400 text-center py-6">
            Aucun profil consulté pour l&apos;instant.
          </p>
        )}
      </div>

    </main>
  );
}
