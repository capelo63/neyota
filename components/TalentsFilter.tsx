'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Button, Badge, Input, Select } from '@/components/ui';

interface Skill {
  id: string;
  name: string;
  category: string;
}

interface Talent {
  id: string;
  first_name: string;
  last_name: string;
  city: string;
  postal_code?: string;
  bio?: string;
  max_distance_km?: number;
  latitude?: number;
  longitude?: number;
  skills: Skill[];
}

interface TalentsFilterProps {
  talents: Talent[];
  allSkills: Skill[];
}

const CATEGORY_LABELS: Record<string, string> = {
  technical: '💻 Technique',
  business: '💼 Business',
  creative: '🎨 Créatif',
  operational: '⚙️ Opérationnel',
  expertise: '🎓 Expertise',
};

// Haversine formula to calculate distance between two points
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default function TalentsFilter({ talents, allSkills }: TalentsFilterProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [locationSearch, setLocationSearch] = useState('');
  const [radiusKm, setRadiusKm] = useState(50);

  // Get unique categories
  const categories = useMemo(() => {
    const cats = new Set(allSkills.map(s => s.category));
    return Array.from(cats);
  }, [allSkills]);

  // Filter skills by selected category (cascading filter)
  const filteredSkillsList = useMemo(() => {
    if (!selectedCategory) return allSkills;
    return allSkills.filter(skill => skill.category === selectedCategory);
  }, [allSkills, selectedCategory]);

  // Get unique cities for location autocomplete
  const uniqueCities = useMemo(() => {
    const cities = new Set(talents.map(t => t.city));
    return Array.from(cities).sort();
  }, [talents]);

  // Find reference location coordinates
  const referenceLocation = useMemo(() => {
    if (!locationSearch) return null;
    const talent = talents.find(t =>
      t.city.toLowerCase() === locationSearch.toLowerCase() &&
      t.latitude &&
      t.longitude
    );
    return talent ? { lat: talent.latitude!, lon: talent.longitude! } : null;
  }, [locationSearch, talents]);

  // Filter talents
  const filteredTalents = useMemo(() => {
    return talents.filter(talent => {
      // Name search
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesName = `${talent.first_name} ${talent.last_name}`.toLowerCase().includes(query);
        if (!matchesName) return false;
      }

      // Skills filter
      if (selectedSkills.length > 0) {
        const talentSkillIds = talent.skills.map(s => s.id);
        const hasAllSkills = selectedSkills.every(skillId => talentSkillIds.includes(skillId));
        if (!hasAllSkills) return false;
      }

      // Category filter
      if (selectedCategory) {
        const hasSkillInCategory = talent.skills.some(s => s.category === selectedCategory);
        if (!hasSkillInCategory) return false;
      }

      // Location/radius filter
      if (referenceLocation && talent.latitude && talent.longitude) {
        const distance = calculateDistance(
          referenceLocation.lat,
          referenceLocation.lon,
          talent.latitude,
          talent.longitude
        );
        if (distance > radiusKm) return false;
      }

      return true;
    });
  }, [talents, searchQuery, selectedSkills, selectedCategory, referenceLocation, radiusKm]);

  // Toggle skill selection
  const toggleSkill = (skillId: string) => {
    setSelectedSkills(prev =>
      prev.includes(skillId)
        ? prev.filter(id => id !== skillId)
        : [...prev, skillId]
    );
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery('');
    setSelectedSkills([]);
    setSelectedCategory('');
    setLocationSearch('');
    setRadiusKm(50);
  };

  const hasActiveFilters = searchQuery || selectedSkills.length > 0 || selectedCategory || locationSearch;

  return (
    <div className="grid lg:grid-cols-4 gap-6">
      {/* Filters Sidebar */}
      <aside className="lg:col-span-1">
        <div className="bg-white rounded-xl shadow-sm p-6 sticky top-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-neutral-900">Filtres</h2>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                Réinitialiser
              </button>
            )}
          </div>

          <div className="space-y-5">
            {/* Search by name */}
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-neutral-700 mb-2">
                Rechercher par nom
              </label>
              <Input
                id="search"
                type="text"
                placeholder="Prénom ou nom..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Location search */}
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-neutral-700 mb-2">
                Localisation
              </label>
              <input
                id="location"
                type="text"
                list="cities"
                placeholder="Ville de référence..."
                value={locationSearch}
                onChange={(e) => setLocationSearch(e.target.value)}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <datalist id="cities">
                {uniqueCities.map(city => (
                  <option key={city} value={city} />
                ))}
              </datalist>
            </div>

            {/* Radius slider */}
            {locationSearch && (
              <div>
                <label htmlFor="radius" className="block text-sm font-medium text-neutral-700 mb-2">
                  Rayon: {radiusKm} km
                </label>
                <input
                  id="radius"
                  type="range"
                  min="5"
                  max="200"
                  step="5"
                  value={radiusKm}
                  onChange={(e) => setRadiusKm(Number(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-neutral-500 mt-1">
                  <span>5 km</span>
                  <span>200 km</span>
                </div>
              </div>
            )}

            {/* Category Filter */}
            <Select
              label="Catégorie de compétences"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              options={[
                { value: '', label: 'Toutes les catégories' },
                ...categories.map(cat => ({
                  value: cat,
                  label: CATEGORY_LABELS[cat] || cat,
                })),
              ]}
            />

            {/* Skills Filter */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Compétences
                {selectedCategory && (
                  <span className="ml-2 text-xs text-primary-600">
                    ({filteredSkillsList.length} dans cette catégorie)
                  </span>
                )}
              </label>
              <div className="max-h-48 overflow-y-auto p-2 border border-neutral-200 rounded-lg space-y-1">
                {filteredSkillsList.length === 0 ? (
                  <p className="text-sm text-neutral-500">
                    {selectedCategory ? 'Aucune compétence dans cette catégorie' : 'Aucune compétence'}
                  </p>
                ) : (
                  filteredSkillsList.map(skill => (
                    <label
                      key={skill.id}
                      className="flex items-center gap-2 p-1 hover:bg-neutral-50 rounded cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedSkills.includes(skill.id)}
                        onChange={() => toggleSkill(skill.id)}
                        className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-sm text-neutral-700">{skill.name}</span>
                    </label>
                  ))
                )}
              </div>
              {selectedSkills.length > 0 && (
                <p className="text-xs text-neutral-600 mt-2">
                  {selectedSkills.length} sélectionnée{selectedSkills.length > 1 ? 's' : ''}
                </p>
              )}
            </div>
          </div>

          {/* Results count */}
          <div className="mt-6 pt-6 border-t border-neutral-200">
            <p className="text-sm text-neutral-600">
              <strong>{filteredTalents.length}</strong> talent{filteredTalents.length > 1 ? 's' : ''} trouvé{filteredTalents.length > 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </aside>

      {/* Talents List */}
      <div className="lg:col-span-3">
        {filteredTalents.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-semibold text-neutral-900 mb-4">
              Aucun talent trouvé
            </h3>
            <p className="text-neutral-600 mb-6">
              Essayez de modifier vos critères de recherche pour trouver plus de talents.
            </p>
            {hasActiveFilters && (
              <Button variant="primary" onClick={clearFilters}>
                Réinitialiser les filtres
              </Button>
            )}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredTalents.map((talent) => (
              <div
                key={talent.id}
                className="bg-white rounded-xl shadow-sm p-6 border border-neutral-200 hover:shadow-md transition-shadow"
              >
                {/* Header */}
                <div className="mb-4">
                  <h3 className="text-xl font-semibold text-neutral-900 mb-2">
                    {talent.first_name} {talent.last_name}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-neutral-600">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                    <span>{talent.city}</span>
                    {referenceLocation && talent.latitude && talent.longitude && (
                      <span className="text-primary-600">
                        • {Math.round(calculateDistance(
                          referenceLocation.lat,
                          referenceLocation.lon,
                          talent.latitude,
                          talent.longitude
                        ))} km
                      </span>
                    )}
                  </div>
                </div>

                {/* Bio */}
                {talent.bio && (
                  <p className="text-neutral-600 text-sm mb-4 line-clamp-3">
                    {talent.bio}
                  </p>
                )}

                {/* Skills */}
                {talent.skills && talent.skills.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-neutral-700 mb-2">Compétences:</p>
                    <div className="flex flex-wrap gap-2">
                      {talent.skills.slice(0, 4).map((skill) => (
                        <Badge key={skill.id} variant="secondary" className="text-xs">
                          {skill.name}
                        </Badge>
                      ))}
                      {talent.skills.length > 4 && (
                        <Badge variant="secondary" className="text-xs">
                          +{talent.skills.length - 4}
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {/* Distance */}
                {talent.max_distance_km && (
                  <p className="text-sm text-neutral-500 mb-4">
                    Rayon de déplacement: {talent.max_distance_km} km
                  </p>
                )}

                {/* CTA */}
                <Link href={`/profile/${talent.id}`}>
                  <Button variant="ghost" size="sm" className="w-full">
                    Voir le profil →
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
