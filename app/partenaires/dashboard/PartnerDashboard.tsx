'use client';

import { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { REGIONS_FRANCE, DEPARTMENTS_FRANCE, getOrgTypeLabel } from '@/lib/constants/france-geo';
import PartnerProfileModal from './PartnerProfileModal';
import type { VisibleProfile, PartnerOrg } from './page';

const PartnerMap = dynamic(() => import('./PartnerMap'), { ssr: false });

const PAGE_SIZE = 20;

function initials(p: VisibleProfile) {
  return `${p.first_name[0] ?? ''}${p.last_name[0] ?? ''}`.toUpperCase();
}

function scopeLabel(org: PartnerOrg): string {
  if (!org.territory_scope || org.territory_scope === 'national') return 'National';
  const codes = org.territory_codes ?? [];
  if (org.territory_scope === 'regional') {
    const names = codes.map(
      (c) => REGIONS_FRANCE.find((r) => r.code === c)?.name ?? c
    );
    return `Régional — ${names.join(', ')}`;
  }
  const names = codes.map(
    (c) => DEPARTMENTS_FRANCE.find((d) => d.code === c)?.name ?? c
  );
  return `Départemental — ${names.join(', ')}`;
}

// Returns the 2 or 3-char department code from a postal code
function deptFromPostal(postal: string): string {
  const clean = postal.replace(/\s/g, '');
  if (clean.startsWith('97') || clean.startsWith('98')) return clean.slice(0, 3);
  return clean.slice(0, 2);
}

export default function PartnerDashboard({
  org,
  profiles,
}: {
  org: PartnerOrg;
  profiles: VisibleProfile[];
}) {
  const [roleFilter, setRoleFilter] = useState<'all' | 'entrepreneur' | 'talent'>('all');
  const [selectedTerritoryCodes, setSelectedTerritoryCodes] = useState<string[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<VisibleProfile | null>(null);
  const [page, setPage] = useState(1);

  // Territory filter options
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

  // Apply filters
  const filteredProfiles = useMemo(() => {
    let list = profiles;

    if (roleFilter !== 'all') {
      list = list.filter((p) => p.role === roleFilter);
    }

    if (selectedTerritoryCodes.length > 0) {
      list = list.filter((p) => {
        if (!org.territory_scope || org.territory_scope === 'national') {
          // Filter by region: match profile.region to selected codes
          return p.region != null && selectedTerritoryCodes.includes(p.region);
        }
        if (org.territory_scope === 'regional') {
          return p.region != null && selectedTerritoryCodes.includes(p.region);
        }
        // Departmental: match postal code prefix
        if (!p.postal_code) return false;
        const dept = deptFromPostal(p.postal_code);
        return selectedTerritoryCodes.includes(dept);
      });
    }

    return list;
  }, [profiles, roleFilter, selectedTerritoryCodes, org.territory_scope]);

  const pagedProfiles = filteredProfiles.slice(0, page * PAGE_SIZE);
  const hasMore = filteredProfiles.length > page * PAGE_SIZE;

  function toggleTerritory(code: string) {
    setPage(1);
    setSelectedTerritoryCodes((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  }

  function handleRoleFilter(v: 'all' | 'entrepreneur' | 'talent') {
    setRoleFilter(v);
    setPage(1);
  }

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
      <div className="bg-white border border-neutral-200 rounded-xl p-4 mb-6 flex flex-wrap gap-4 items-start">
        {/* Role toggle */}
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

        {/* Territory filter */}
        {territoryOptions.length > 0 && (
          <div className="flex-1 min-w-0">
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
                  onClick={() => toggleTerritory(opt.code)}
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

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs text-neutral-500 self-end pb-0.5">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-orange-500 inline-block" />
            Porteurs
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
              <button
                key={p.id}
                onClick={() => setSelectedProfile(p)}
                className="bg-white rounded-xl border border-neutral-200 p-4 text-left hover:border-primary-300 hover:shadow-sm transition-all group"
              >
                <div className="flex items-center gap-3 mb-3">
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
          onClose={() => setSelectedProfile(null)}
        />
      )}
    </main>
  );
}
