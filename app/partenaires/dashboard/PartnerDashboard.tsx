'use client';

import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import dynamic from 'next/dynamic';
import { createBrowserClient } from '@supabase/ssr';
import { REGIONS_FRANCE, DEPARTMENTS_FRANCE, getOrgTypeLabel } from '@/lib/constants/france-geo';
import { NEED_CATEGORIES, SKILL_CATEGORIES } from '@/lib/constants/needs-skills';
import PartnerProfileModal from './PartnerProfileModal';
import type { VisibleProfile, PartnerOrg } from './page';

const PartnerMap = dynamic(() => import('./PartnerMap'), { ssr: false });

const PAGE_SIZE = 20;

const PHASE_LABELS: Record<string, string> = {
  ideation:        'Idéation',
  mvp_development: 'En construction',
  launch:          'Lancement',
  growth:          'Croissance',
  scaling:         'Structuration',
};

const PROJECT_CATEGORY_OPTIONS: { code: string; label: string }[] = [
  { code: 'agriculture',  label: 'Agriculture / Agroalimentaire' },
  { code: 'mobility',     label: 'Mobilité / Transport' },
  { code: 'industry',     label: 'Industrie / Manufacturing' },
  { code: 'tech',         label: 'Tech / Digital' },
  { code: 'health',       label: 'Santé / Bien-être' },
  { code: 'education',    label: 'Éducation / Formation' },
  { code: 'real_estate',  label: 'Immobilier / Construction' },
  { code: 'environment',  label: 'Environnement / Écologie' },
  { code: 'culture',      label: 'Culture / Créatif' },
  { code: 'services',     label: 'Services / Consulting' },
  { code: 'commerce',     label: 'Commerce / Retail' },
  { code: 'hospitality',  label: 'Restauration / Hôtellerie' },
  { code: 'finance',      label: 'Finance / Fintech' },
  { code: 'energy',       label: 'Énergie' },
  { code: 'entertainment',label: 'Divertissement / Loisirs' },
  { code: 'social',       label: 'Social / Solidaire' },
];

function initials(p: VisibleProfile) {
  return `${p.first_name[0] ?? ''}${p.last_name[0] ?? ''}`.toUpperCase();
}

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

function deptFromPostal(postal: string): string {
  const clean = postal.replace(/\s/g, '');
  if (clean.startsWith('97') || clean.startsWith('98')) return clean.slice(0, 3);
  return clean.slice(0, 2);
}

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      className="w-4 h-4"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth={2}
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
      />
    </svg>
  );
}

type AccentColor = 'orange' | 'green' | 'primary';

const ACCENT_CLASSES: Record<AccentColor, { chip: string; check: string; btn: string }> = {
  orange:  { chip: 'bg-orange-100 text-orange-700',  check: 'accent-orange-500',   btn: 'border-orange-300' },
  green:   { chip: 'bg-green-100 text-green-700',    check: 'accent-green-600',    btn: 'border-green-300' },
  primary: { chip: 'bg-primary-100 text-primary-700', check: 'accent-primary-600', btn: 'border-primary-300' },
};

function MultiSelect({
  label,
  options,
  selected,
  onChange,
  accentColor = 'primary',
}: {
  label: string;
  options: { code: string; label: string }[];
  selected: string[];
  onChange: (next: string[]) => void;
  accentColor?: AccentColor;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const colors = ACCENT_CLASSES[accentColor];

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  function toggleOption(code: string) {
    onChange(selected.includes(code) ? selected.filter((x) => x !== code) : [...selected, code]);
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 text-sm border border-neutral-200 rounded-lg px-3 py-1.5 bg-white hover:border-primary-300 transition-colors whitespace-nowrap"
      >
        <span className="font-medium text-neutral-700">{label}</span>
        {selected.length > 0 && (
          <span className="bg-primary-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center leading-none">
            {selected.length}
          </span>
        )}
        <svg
          className={`w-3.5 h-3.5 text-neutral-400 transition-transform shrink-0 ${open ? 'rotate-180' : ''}`}
          fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute z-[9999] mt-1 w-64 bg-white border border-neutral-200 rounded-xl shadow-lg py-2 max-h-64 overflow-y-auto">
          {options.map((opt) => (
            <label
              key={opt.code}
              className="flex items-center gap-2.5 px-3 py-1.5 hover:bg-neutral-50 cursor-pointer text-sm text-neutral-700"
            >
              <input
                type="checkbox"
                checked={selected.includes(opt.code)}
                onChange={() => toggleOption(opt.code)}
                className={colors.check}
              />
              {opt.label}
            </label>
          ))}
        </div>
      )}

      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {selected.map((code) => {
            const opt = options.find((o) => o.code === code);
            return (
              <span
                key={code}
                className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${colors.chip}`}
              >
                {opt?.label ?? code}
                <button
                  type="button"
                  onClick={() => onChange(selected.filter((x) => x !== code))}
                  className="hover:opacity-70 leading-none"
                  aria-label={`Retirer ${opt?.label ?? code}`}
                >
                  ×
                </button>
              </span>
            );
          })}
          <button
            type="button"
            onClick={() => onChange([])}
            className="text-xs text-neutral-400 hover:text-neutral-600 underline self-center"
          >
            Tout effacer
          </button>
        </div>
      )}
    </div>
  );
}

const NEED_CATEGORY_OPTIONS = Object.values(NEED_CATEGORIES).map((c) => ({
  code: c.id,
  label: c.label,
}));

const SKILL_CATEGORY_OPTIONS = Object.values(SKILL_CATEGORIES).map((c) => ({
  code: c.id,
  label: c.shortLabel,
}));

const PHASE_OPTIONS = Object.entries(PHASE_LABELS).map(([code, label]) => ({ code, label }));

export default function PartnerDashboard({
  org,
  profiles,
  initialFavoriteIds,
}: {
  org: PartnerOrg;
  profiles: VisibleProfile[];
  initialFavoriteIds: string[];
}) {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // ── Auth ─────────────────────────────────────────────
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setCurrentUserId(user?.id ?? null));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Core filter state ────────────────────────────────
  const [roleFilter, setRoleFilter] = useState<'all' | 'entrepreneur' | 'talent'>('all');
  const [selectedTerritoryCodes, setSelectedTerritoryCodes] = useState<string[]>([]);
  const [page, setPage] = useState(1);

  // ── Search ───────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => clearTimeout(t);
  }, [searchQuery]);

  // ── Advanced filters ─────────────────────────────────
  const [selectedPhases, setSelectedPhases] = useState<string[]>([]);
  const [selectedNeedCats, setSelectedNeedCats] = useState<string[]>([]);
  const [selectedSkillCats, setSelectedSkillCats] = useState<string[]>([]);
  const [selectedProjectCats, setSelectedProjectCats] = useState<string[]>([]);

  // ── Favorites ────────────────────────────────────────
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(
    () => new Set(initialFavoriteIds)
  );
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  const toggleFavorite = useCallback(async (profileId: string) => {
    if (!currentUserId) return;
    const isFav = favoriteIds.has(profileId);
    setFavoriteIds((prev) => {
      const next = new Set(prev);
      if (isFav) next.delete(profileId); else next.add(profileId);
      return next;
    });
    if (isFav) {
      await supabase.from('partner_favorites').delete()
        .eq('partner_user_id', currentUserId)
        .eq('favorite_profile_id', profileId);
    } else {
      await supabase.from('partner_favorites').insert({
        partner_user_id: currentUserId,
        favorite_profile_id: profileId,
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUserId, favoriteIds]);

  // ── Modal ────────────────────────────────────────────
  const [selectedProfile, setSelectedProfile] = useState<VisibleProfile | null>(null);

  // ── Territory options ────────────────────────────────
  const territoryOptions = useMemo(() => {
    if (!org.territory_scope || org.territory_scope === 'national') {
      return REGIONS_FRANCE.map((r) => ({ code: r.code, label: r.name }));
    }
    if (org.territory_scope === 'regional') {
      return (org.territory_codes ?? []).map((c) => ({
        code: c,
        label: REGIONS_FRANCE.find((r) => r.code === c)?.name ?? c,
      }));
    }
    return (org.territory_codes ?? []).map((c) => ({
      code: c,
      label: DEPARTMENTS_FRANCE.find((d) => d.code === c)?.name ?? c,
    }));
  }, [org]);

  // ── Full filter chain ────────────────────────────────
  const filteredProfiles = useMemo(() => {
    let list = profiles;

    if (roleFilter !== 'all') {
      list = list.filter((p) => p.role === roleFilter);
    }

    if (selectedTerritoryCodes.length > 0) {
      list = list.filter((p) => {
        if (!org.territory_scope || org.territory_scope === 'national') {
          return p.region != null && selectedTerritoryCodes.includes(p.region);
        }
        if (org.territory_scope === 'regional') {
          return p.region != null && selectedTerritoryCodes.includes(p.region);
        }
        if (!p.postal_code) return false;
        return selectedTerritoryCodes.includes(deptFromPostal(p.postal_code));
      });
    }

    if (debouncedSearch.trim()) {
      const q = debouncedSearch.toLowerCase();
      list = list.filter(
        (p) =>
          `${p.first_name} ${p.last_name}`.toLowerCase().includes(q) ||
          (p.bio ?? '').toLowerCase().includes(q) ||
          (p.city ?? '').toLowerCase().includes(q)
      );
    }

    if (selectedPhases.length > 0) {
      list = list.filter(
        (p) =>
          p.role !== 'entrepreneur' ||
          p.project_phases.some((ph) => selectedPhases.includes(ph))
      );
    }

    if (selectedNeedCats.length > 0) {
      list = list.filter(
        (p) =>
          p.role !== 'entrepreneur' ||
          p.need_categories.some((nc) => selectedNeedCats.includes(nc))
      );
    }

    if (selectedProjectCats.length > 0) {
      list = list.filter(
        (p) =>
          p.role !== 'entrepreneur' ||
          p.project_categories.some((pc) => selectedProjectCats.includes(pc))
      );
    }

    if (selectedSkillCats.length > 0) {
      list = list.filter(
        (p) =>
          p.role !== 'talent' ||
          p.skill_categories.some((sc) => selectedSkillCats.includes(sc))
      );
    }

    if (showFavoritesOnly) {
      list = list.filter((p) => favoriteIds.has(p.id));
    }

    return list;
  }, [
    profiles, roleFilter, selectedTerritoryCodes, debouncedSearch,
    selectedPhases, selectedNeedCats, selectedProjectCats, selectedSkillCats,
    showFavoritesOnly, favoriteIds, org.territory_scope,
  ]);

  const pagedProfiles = filteredProfiles.slice(0, page * PAGE_SIZE);
  const hasMore = filteredProfiles.length > page * PAGE_SIZE;

  // ── Toggle helpers ───────────────────────────────────
  function toggle<T extends string>(arr: T[], setArr: (v: T[]) => void, val: T) {
    setPage(1);
    setArr(arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val]);
  }

  function handleRoleFilter(v: 'all' | 'entrepreneur' | 'talent') {
    setRoleFilter(v);
    setPage(1);
    if (v === 'talent') {
      setSelectedPhases([]);
      setSelectedNeedCats([]);
      setSelectedProjectCats([]);
    }
    if (v === 'entrepreneur') setSelectedSkillCats([]);
  }

  const showEntrepreneurFilters = roleFilter === 'all' || roleFilter === 'entrepreneur';
  const showTalentFilters       = roleFilter === 'all' || roleFilter === 'talent';

  // ── Render ───────────────────────────────────────────
  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      {/* ── Header ── */}
      <div className="mb-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="inline-flex items-center gap-2 bg-primary-50 text-primary-700 text-xs font-medium px-3 py-1 rounded-full mb-3">
              Espace partenaire
            </div>
            <h1 className="text-2xl font-bold text-neutral-900">{org.organization_name}</h1>
            <p className="text-sm text-neutral-500 mt-1">
              {getOrgTypeLabel(org.organization_type)} · {scopeLabel(org)}
            </p>
          </div>
          <div className="bg-white border border-neutral-200 rounded-xl px-5 py-3 text-center shrink-0">
            <p className="text-2xl font-bold text-primary-600">{filteredProfiles.length}</p>
            <p className="text-xs text-neutral-500 mt-0.5">
              profil{filteredProfiles.length !== 1 ? 's' : ''} visible{filteredProfiles.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </div>

      {/* ── Filters ── */}
      <div className="bg-white border border-neutral-200 rounded-xl p-4 mb-6 flex flex-col gap-4">

        {/* Keyword search */}
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
          </svg>
          <input
            type="text"
            placeholder="Rechercher par nom, ville, bio…"
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
            className="w-full pl-9 pr-8 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-neutral-50"
          />
          {searchQuery && (
            <button
              onClick={() => { setSearchQuery(''); setDebouncedSearch(''); setPage(1); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 text-lg leading-none"
              aria-label="Effacer"
            >
              ×
            </button>
          )}
        </div>

        {/* Role toggle + Favorites toggle */}
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <p className="text-xs font-medium text-neutral-500 mb-2">Type de profil</p>
            <div className="flex rounded-lg border border-neutral-200 overflow-hidden text-sm">
              {([['all', 'Les deux'], ['entrepreneur', 'Porteurs'], ['talent', 'Talents']] as const).map(([val, label]) => (
                <button
                  key={val}
                  onClick={() => handleRoleFilter(val)}
                  className={`px-4 py-1.5 font-medium transition-colors ${
                    roleFilter === val
                      ? 'bg-primary-600 text-white'
                      : 'text-neutral-600 hover:bg-neutral-50'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => { setShowFavoritesOnly((v) => !v); setPage(1); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors ${
              showFavoritesOnly
                ? 'bg-yellow-50 border-yellow-300 text-yellow-700'
                : 'border-neutral-200 text-neutral-600 hover:bg-neutral-50'
            }`}
          >
            <StarIcon filled={showFavoritesOnly} />
            Favoris{favoriteIds.size > 0 ? ` (${favoriteIds.size})` : ''}
          </button>
        </div>

        {/* Territory filter */}
        {territoryOptions.length > 0 && (
          <div>
            <p className="text-xs font-medium text-neutral-500 mb-2">
              {!org.territory_scope || org.territory_scope === 'national'
                ? 'Filtrer par région'
                : org.territory_scope === 'regional'
                ? 'Filtrer par région'
                : 'Filtrer par département'}
              {selectedTerritoryCodes.length > 0 && (
                <button
                  onClick={() => { setSelectedTerritoryCodes([]); setPage(1); }}
                  className="ml-2 text-primary-600 hover:underline font-normal"
                >
                  Tout voir
                </button>
              )}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {territoryOptions.map((opt) => (
                <button
                  key={opt.code}
                  onClick={() => toggle(selectedTerritoryCodes, setSelectedTerritoryCodes, opt.code)}
                  className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                    selectedTerritoryCodes.includes(opt.code)
                      ? 'bg-primary-600 text-white border-primary-600'
                      : 'border-neutral-200 text-neutral-600 hover:border-primary-300'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Advanced filters — MultiSelect dropdowns */}
        {(showEntrepreneurFilters || showTalentFilters) && (
          <div className="flex flex-wrap gap-3 items-start">
            {showEntrepreneurFilters && (
              <MultiSelect
                label="Phase du projet (porteur)"
                options={PHASE_OPTIONS}
                selected={selectedPhases}
                onChange={(v) => { setSelectedPhases(v); setPage(1); }}
                accentColor="orange"
              />
            )}
            {showEntrepreneurFilters && (
              <MultiSelect
                label="Besoins recherchés (porteurs)"
                options={NEED_CATEGORY_OPTIONS}
                selected={selectedNeedCats}
                onChange={(v) => { setSelectedNeedCats(v); setPage(1); }}
                accentColor="orange"
              />
            )}
            {showEntrepreneurFilters && (
              <MultiSelect
                label="Thématiques des projets (porteurs)"
                options={PROJECT_CATEGORY_OPTIONS}
                selected={selectedProjectCats}
                onChange={(v) => { setSelectedProjectCats(v); setPage(1); }}
                accentColor="primary"
              />
            )}
            {showTalentFilters && (
              <MultiSelect
                label="Compétences des talents"
                options={SKILL_CATEGORY_OPTIONS}
                selected={selectedSkillCats}
                onChange={(v) => { setSelectedSkillCats(v); setPage(1); }}
                accentColor="green"
              />
            )}
          </div>
        )}

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs text-neutral-500">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-orange-500 inline-block" />
            Porteurs d&apos;initiative
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-green-500 inline-block" />
            Talents
          </span>
        </div>
      </div>

      {/* ── Map ── */}
      <div className="rounded-2xl overflow-hidden border border-neutral-200 shadow-sm mb-6" style={{ height: '380px' }}>
        <PartnerMap profiles={filteredProfiles} onProfileClick={setSelectedProfile} />
      </div>

      {/* ── List ── */}
      {filteredProfiles.length === 0 ? (
        <div className="bg-white rounded-2xl border border-neutral-200 p-12 text-center">
          <p className="text-neutral-500 text-sm">
            Aucun profil visible avec ces filtres.{' '}
            {profiles.length === 0
              ? 'Aucun porteur ou talent n\'a activé sa visibilité partenaire pour l\'instant.'
              : 'Modifiez les filtres pour voir plus de profils.'}
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {pagedProfiles.map((p) => (
              <div key={p.id} className="relative">
                <button
                  onClick={() => setSelectedProfile(p)}
                  className="w-full bg-white rounded-xl border border-neutral-200 p-4 text-left hover:border-primary-300 hover:shadow-sm transition-all group"
                >
                  <div className="flex items-center gap-3 mb-3 pr-6">
                    {p.avatar_url ? (
                      <img src={p.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover shrink-0" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center shrink-0">
                        <span className="text-sm font-bold text-neutral-500">{initials(p)}</span>
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="font-semibold text-sm text-neutral-900 truncate group-hover:text-primary-700">
                        {p.first_name} {p.last_name}
                      </p>
                      <p className="text-xs text-neutral-400 truncate">{p.city}</p>
                    </div>
                  </div>
                  <span className={`inline-block text-xs font-medium px-2.5 py-0.5 rounded-full ${
                    p.role === 'entrepreneur' ? 'bg-orange-50 text-orange-700' : 'bg-green-50 text-green-700'
                  }`}>
                    {p.role === 'entrepreneur' ? 'Porteur d\'initiative' : 'Talent'}
                  </span>
                  {p.bio && (
                    <p className="text-xs text-neutral-500 mt-2 line-clamp-2 leading-relaxed">{p.bio}</p>
                  )}
                </button>

                <button
                  onClick={() => void toggleFavorite(p.id)}
                  title={favoriteIds.has(p.id) ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                  className={`absolute top-3 right-3 p-1 rounded-full hover:bg-neutral-100 transition-colors ${
                    favoriteIds.has(p.id) ? 'text-yellow-400' : 'text-neutral-300 hover:text-neutral-500'
                  }`}
                >
                  <StarIcon filled={favoriteIds.has(p.id)} />
                </button>
              </div>
            ))}
          </div>

          {hasMore && (
            <div className="text-center mt-6">
              <button
                onClick={() => setPage((n) => n + 1)}
                className="px-6 py-2.5 bg-white border border-neutral-200 text-neutral-700 text-sm font-medium rounded-lg hover:bg-neutral-50 transition-colors"
              >
                Voir {Math.min(PAGE_SIZE, filteredProfiles.length - page * PAGE_SIZE)} profils de plus
              </button>
            </div>
          )}
        </>
      )}

      {/* ── Modal ── */}
      {selectedProfile && (
        <PartnerProfileModal
          profile={selectedProfile}
          isFavorite={favoriteIds.has(selectedProfile.id)}
          onToggleFavorite={toggleFavorite}
          onClose={() => setSelectedProfile(null)}
        />
      )}
    </main>
  );
}
