'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Button, Badge } from '@/components/ui';

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

export default function TalentsFilter({ talents, allSkills }: TalentsFilterProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  // Get unique categories from all skills
  const categories = useMemo(() => {
    const cats = new Set(allSkills.map(s => s.category));
    return Array.from(cats);
  }, [allSkills]);

  // Filter talents based on search and filters
  const filteredTalents = useMemo(() => {
    return talents.filter(talent => {
      // Search filter (name or city)
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesName = `${talent.first_name} ${talent.last_name}`.toLowerCase().includes(query);
        const matchesCity = talent.city.toLowerCase().includes(query);
        if (!matchesName && !matchesCity) return false;
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

      return true;
    });
  }, [talents, searchQuery, selectedSkills, selectedCategory]);

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
  };

  const hasActiveFilters = searchQuery || selectedSkills.length > 0 || selectedCategory;

  return (
    <div>
      {/* Filters Section */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-8 border border-neutral-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-neutral-900">Filtres</h2>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-sm text-primary-600 hover:text-primary-700"
            >
              Réinitialiser
            </button>
          )}
        </div>

        {/* Search Bar */}
        <div className="mb-4">
          <label htmlFor="search" className="block text-sm font-medium text-neutral-700 mb-2">
            Rechercher
          </label>
          <input
            id="search"
            type="text"
            placeholder="Nom ou ville..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        {/* Category Filter */}
        <div className="mb-4">
          <label htmlFor="category" className="block text-sm font-medium text-neutral-700 mb-2">
            Catégorie de compétences
          </label>
          <select
            id="category"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="">Toutes les catégories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {CATEGORY_LABELS[cat] || cat}
              </option>
            ))}
          </select>
        </div>

        {/* Skills Filter */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Compétences (sélection multiple)
          </label>
          <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-2 border border-neutral-200 rounded-lg">
            {allSkills.length === 0 ? (
              <p className="text-sm text-neutral-500">Aucune compétence disponible</p>
            ) : (
              allSkills.map(skill => (
                <button
                  key={skill.id}
                  onClick={() => toggleSkill(skill.id)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    selectedSkills.includes(skill.id)
                      ? 'bg-primary-600 text-white'
                      : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                  }`}
                >
                  {skill.name}
                </button>
              ))
            )}
          </div>
          {selectedSkills.length > 0 && (
            <p className="text-xs text-neutral-600 mt-2">
              {selectedSkills.length} compétence{selectedSkills.length > 1 ? 's' : ''} sélectionnée{selectedSkills.length > 1 ? 's' : ''}
            </p>
          )}
        </div>
      </div>

      {/* Results count */}
      <div className="mb-4">
        <p className="text-sm text-neutral-600">
          <strong>{filteredTalents.length}</strong> talent{filteredTalents.length > 1 ? 's' : ''} trouvé{filteredTalents.length > 1 ? 's' : ''}
          {hasActiveFilters && ` sur ${talents.length}`}
        </p>
      </div>

      {/* Talents Grid */}
      {filteredTalents.length === 0 ? (
        <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-sm p-12 text-center">
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
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTalents.map((talent) => (
            <div
              key={talent.id}
              className="bg-white rounded-xl shadow-sm p-6 border border-neutral-200 hover:shadow-md transition-shadow"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-neutral-900 mb-2">
                    {talent.first_name} {talent.last_name}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-neutral-600">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                    <span>{talent.city}</span>
                  </div>
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
  );
}
