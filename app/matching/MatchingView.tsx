'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import Link from 'next/link';
import { Button } from '@/components/ui';

interface Project {
  id: string;
  title: string;
  short_pitch: string;
  full_description: string;
  current_phase: string;
  city: string;
  postal_code: string;
  region: string | null;
  is_remote_possible: boolean;
  preferred_radius_km: number;
  status: string;
  created_at: string;
  owner_id: string;
  location: any;
  owner: {
    first_name: string;
    last_name: string;
    city: string;
  };
  skills: Array<{
    id: number;
    name: string;
    category: string;
  }>;
  distance_km?: number;
  matching_score?: number;
  matching_skills_count?: number;
}

interface TalentProfile {
  id: string;
  first_name: string;
  last_name: string;
  city: string;
  postal_code: string;
  max_distance_km: number;
  location: any;
  role: string;
}

interface UserSkill {
  skill_id: number;
}

const PHASE_LABELS: Record<string, string> = {
  ideation: 'Idéation',
  mvp_development: 'En construction',
  launch: 'Lancement',
  growth: 'Croissance',
  scaling: 'Structuration',
};

const PHASE_EMOJIS: Record<string, string> = {
  ideation: '💡',
  mvp_development: '🛠️',
  launch: '🚀',
  growth: '📈',
  scaling: '🏢',
};

export default function MatchingView() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [profile, setProfile] = useState<TalentProfile | null>(null);
  const [userSkills, setUserSkills] = useState<number[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPhase, setSelectedPhase] = useState<string>('all');
  const [maxDistance, setMaxDistance] = useState<number>(50);
  const [showRemoteOnly, setShowRemoteOnly] = useState(false);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterAndSortProjects();
  }, [projects, selectedPhase, maxDistance, showRemoteOnly]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
        return;
      }

      setCurrentUser(user);

      // Get profile with coordinates using RPC function
      const { data: profileData, error: profileError } = await supabase.rpc(
        'get_talent_profile_with_coords',
        { talent_id: user.id }
      );

      if (profileError || !profileData || profileData.length === 0) {
        console.error('[MATCHING] Profile error:', profileError);
        setError('Profil introuvable');
        setIsLoading(false);
        return;
      }

      const profile = profileData[0]; // RPC returns array

      if (profile.role !== 'talent') {
        setError('Cette page est réservée aux talents');
        setIsLoading(false);
        return;
      }

      // Check if profile has location data
      if (!profile.lng || !profile.lat) {
        setError('Votre profil n\'a pas de coordonnées GPS. Veuillez mettre à jour votre code postal dans les paramètres de votre profil.');
        setIsLoading(false);
        return;
      }

      const userLng = profile.lng;
      const userLat = profile.lat;

      // Store profile for state (add location object for compatibility)
      const profileWithLocation = {
        ...profile,
        location: {
          type: 'Point',
          coordinates: [userLng, userLat]
        }
      };
      setProfile(profileWithLocation);
      setMaxDistance(profile.max_distance_km);

      // Get user skills
      const { data: skillsData } = await supabase
        .from('user_skills')
        .select('skill_id')
        .eq('user_id', user.id);

      const skillIds = (skillsData || []).map((s) => s.skill_id);
      setUserSkills(skillIds);

      // Get all active projects with distance calculation
      const { data: projectsData, error: projectsError } = await supabase.rpc(
        'get_nearby_projects',
        {
          user_lat: userLat,
          user_lng: userLng,
          search_radius_km: profile.max_distance_km * 2, // Use user preference * 2 for broader search
        }
      );

      if (projectsError) {
        console.error('[MATCHING] RPC get_nearby_projects error (CRITICAL):', projectsError);
        setError(
          'Impossible de calculer les distances entre votre localisation et les projets. ' +
          'Le matching territorial ne peut pas fonctionner. Veuillez réessayer ou contacter le support.'
        );
        setIsLoading(false);
        return;
      }

      if (projectsData) {
        // Load project skills for matching
        await loadProjectsWithSkills(projectsData);
      }

      setIsLoading(false);
    } catch (err: any) {
      console.error('Error loading data:', err);
      setError(err.message || 'Erreur lors du chargement');
      setIsLoading(false);
    }
  };

  const loadProjectsWithSkills = async (projectsData: any[]) => {
    // Get skills for all projects
    const projectIds = projectsData.map((p) => p.id);
    
    const { data: projectSkillsData } = await supabase
      .from('project_skills_needed')
      .select(`
        project_id,
        skill:skills (
          id,
          name,
          category
        )
      `)
      .in('project_id', projectIds);

    // Group skills by project
    const skillsByProject: Record<string, any[]> = {};
    (projectSkillsData || []).forEach((item: any) => {
      const skill = Array.isArray(item.skill) ? item.skill[0] : item.skill;
      if (!skillsByProject[item.project_id]) {
        skillsByProject[item.project_id] = [];
      }
      if (skill) {
        skillsByProject[item.project_id].push(skill);
      }
    });

    // Calculate matching score for each project
    const projectsWithScore = projectsData.map((project) => {
      const projectSkills = skillsByProject[project.id] || [];
      const projectSkillIds = projectSkills.map((s) => s.id);
      
      // Count matching skills
      const matchingSkillsCount = projectSkillIds.filter((skillId) =>
        userSkills.includes(skillId)
      ).length;

      // Calculate score (0-100)
      let score = 0;

      // Distance score (40 points max) - closer is better
      if (project.distance_km !== undefined) {
        const distanceScore = Math.max(0, 40 - (project.distance_km / 2));
        score += distanceScore;
      }

      // Skills match score (40 points max)
      if (projectSkills.length > 0) {
        const skillsScore = (matchingSkillsCount / projectSkills.length) * 40;
        score += skillsScore;
      }

      // Remote work bonus (10 points)
      if (project.is_remote_possible) {
        score += 10;
      }

      // Recent project bonus (10 points)
      const daysSinceCreation = Math.floor(
        (Date.now() - new Date(project.created_at).getTime()) / (1000 * 60 * 60 * 24)
      );
      if (daysSinceCreation < 7) {
        score += 10;
      } else if (daysSinceCreation < 30) {
        score += 5;
      }

      return {
        ...project,
        owner: Array.isArray(project.owner) ? project.owner[0] : project.owner,
        skills: projectSkills,
        matching_skills_count: matchingSkillsCount,
        matching_score: Math.min(100, Math.round(score)),
      };
    });

    // Sort by score
    projectsWithScore.sort((a, b) => (b.matching_score || 0) - (a.matching_score || 0));

    setProjects(projectsWithScore);
  };

  const filterAndSortProjects = () => {
    let filtered = [...projects];

    // Filter by phase
    if (selectedPhase !== 'all') {
      filtered = filtered.filter((p) => p.current_phase === selectedPhase);
    }

    // Filter by distance
    filtered = filtered.filter((p) => {
      if (p.is_remote_possible && showRemoteOnly) return true;
      if (p.distance_km === undefined) return true;
      return p.distance_km <= maxDistance;
    });

    // Filter by remote only
    if (showRemoteOnly) {
      filtered = filtered.filter((p) => p.is_remote_possible);
    }

    setFilteredProjects(filtered);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-neutral-600">Recherche des meilleurs projets pour vous...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-neutral-900 mb-2">Erreur</h2>
          <p className="text-neutral-600 mb-4">{error || 'Une erreur est survenue'}</p>
          <Link href="/dashboard">
            <Button variant="secondary">Retour au dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200 py-4 px-4">
        <div className="container-custom">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">N</span>
              </div>
              <span className="text-2xl font-bold text-neutral-900">NEYOTA</span>
            </Link>
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                <span className="hidden sm:inline">← Retour au dashboard</span>
                <span className="sm:hidden">← Dashboard</span>
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container-custom py-8">
        <div className="max-w-6xl mx-auto">
          {/* Page Header */}
          <div className="bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl shadow-lg p-5 md:p-8 mb-6 text-white">
            <h1 className="text-2xl md:text-4xl font-bold mb-2">
              🎯 Projets suggérés pour vous
            </h1>
            <p className="text-primary-100 text-sm md:text-lg">
              Basé sur votre localisation ({profile.city}) et vos compétences
            </p>
          </div>

          {/* Matching Score Legend */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <div className="text-2xl">📊</div>
              <div className="flex-1">
                <h3 className="font-semibold text-neutral-900 mb-2">Comment est calculé le % de match ?</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-blue-600">40pts</span>
                    <span className="text-neutral-600">Distance (proximité)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-purple-600">40pts</span>
                    <span className="text-neutral-600">Compétences communes</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-green-600">10pts</span>
                    <span className="text-neutral-600">Travail à distance</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-orange-600">10pts</span>
                    <span className="text-neutral-600">Projet récent</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h2 className="text-xl font-bold text-neutral-900 mb-4">Filtres</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Phase Filter */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Phase du projet
                </label>
                <select
                  value={selectedPhase}
                  onChange={(e) => setSelectedPhase(e.target.value)}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="all">Toutes les phases</option>
                  {Object.entries(PHASE_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>
                      {PHASE_EMOJIS[key]} {label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Distance Filter */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Distance max : {maxDistance} km
                </label>
                <input
                  type="range"
                  min="5"
                  max="200"
                  step="5"
                  value={maxDistance}
                  onChange={(e) => setMaxDistance(Number(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-neutral-500 mt-1">
                  <span>5 km</span>
                  <span>200 km</span>
                </div>
              </div>

              {/* Remote Filter */}
              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showRemoteOnly}
                    onChange={(e) => setShowRemoteOnly(e.target.checked)}
                    className="w-5 h-5 text-primary-600 border-neutral-300 rounded focus:ring-primary-500"
                  />
                  <span className="text-sm font-medium text-neutral-700">
                    🏠 Télétravail possible uniquement
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Results Count */}
          <div className="mb-4">
            <p className="text-neutral-600">
              <strong>{filteredProjects.length}</strong> projet
              {filteredProjects.length > 1 ? 's' : ''} trouvé
              {filteredProjects.length > 1 ? 's' : ''}
            </p>
          </div>

          {/* Projects List */}
          <div className="space-y-6">
            {filteredProjects.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-neutral-900 mb-2">
                  Aucun projet trouvé
                </h3>
                <p className="text-neutral-600 mb-4">
                  Essayez d'ajuster vos filtres pour voir plus de résultats.
                </p>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setSelectedPhase('all');
                    setMaxDistance(profile.max_distance_km);
                    setShowRemoteOnly(false);
                  }}
                >
                  Réinitialiser les filtres
                </Button>
              </div>
            ) : (
              filteredProjects.map((project) => (
                <div
                  key={project.id}
                  className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
                >
                  {/* Project Header */}
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4 gap-3">
                    {/* Score badge on mobile: top right, on desktop: right column */}
                    {project.matching_score !== undefined && (
                      <div className="flex sm:hidden items-center justify-between w-full">
                        <Link href={`/projects/${project.id}`}>
                          <h3 className="text-xl font-bold text-neutral-900 hover:text-primary-600 transition-colors cursor-pointer">
                            {project.title}
                          </h3>
                        </Link>
                        <div
                          className={`px-3 py-2 rounded-xl text-xl font-bold shadow-md ml-3 shrink-0 ${
                            project.matching_score >= 70
                              ? 'bg-gradient-to-br from-green-400 to-emerald-600 text-white'
                              : project.matching_score >= 40
                              ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white'
                              : 'bg-gradient-to-br from-neutral-300 to-neutral-500 text-neutral-800'
                          }`}
                        >
                          {project.matching_score}%
                        </div>
                      </div>
                    )}
                    <div className="flex-1 sm:pr-4">
                      <Link href={`/projects/${project.id}`}>
                        <h3 className="hidden sm:block text-2xl font-bold text-neutral-900 hover:text-primary-600 transition-colors cursor-pointer mb-2">
                          {project.title}
                        </h3>
                      </Link>
                      <p className="text-neutral-700 mb-3 mt-1">{project.short_pitch}</p>
                    </div>
                    {project.matching_score !== undefined && (
                      <div className="hidden sm:flex flex-col items-end gap-2 min-w-[140px]">
                        <div
                          className={`px-5 py-3 rounded-xl text-2xl font-bold shadow-lg transform hover:scale-105 transition-transform ${
                            project.matching_score >= 70
                              ? 'bg-gradient-to-br from-green-400 to-emerald-600 text-white'
                              : project.matching_score >= 40
                              ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white'
                              : 'bg-gradient-to-br from-neutral-300 to-neutral-500 text-neutral-800'
                          }`}
                        >
                          {project.matching_score}%
                        </div>
                        <span className="text-xs font-medium text-neutral-500 uppercase tracking-wide">
                          Match
                        </span>
                        {project.matching_skills_count !== undefined && project.matching_skills_count > 0 && (
                          <div className="flex items-center gap-1 text-xs text-emerald-600 font-medium bg-emerald-50 px-2 py-1 rounded">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            {project.matching_skills_count} skill{project.matching_skills_count > 1 ? 's' : ''}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Project Info */}
                  <div className="flex flex-wrap gap-4 mb-4 text-sm text-neutral-600">
                    <div className="flex items-center gap-1">
                      <span className="text-lg">{PHASE_EMOJIS[project.current_phase]}</span>
                      <span>{PHASE_LABELS[project.current_phase]}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-lg">📍</span>
                      <span>{project.city}</span>
                      {project.distance_km !== undefined && (
                        <span className="text-primary-600 font-medium">
                          ({Math.round(project.distance_km)} km)
                        </span>
                      )}
                    </div>
                    {project.is_remote_possible && (
                      <div className="flex items-center gap-1">
                        <span className="text-lg">🏠</span>
                        <span>Télétravail possible</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <span className="text-lg">👤</span>
                      <span>
                        {project.owner.first_name} {project.owner.last_name}
                      </span>
                    </div>
                  </div>

                  {/* Skills */}
                  {project.skills.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm font-medium text-neutral-700 mb-2">
                        Compétences recherchées
                        {project.matching_skills_count !== undefined &&
                          project.matching_skills_count > 0 && (
                            <span className="text-success-600 ml-2">
                              ({project.matching_skills_count} en commun avec vous)
                            </span>
                          )}
                        :
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {project.skills.map((skill) => {
                          const isMatching = userSkills.includes(skill.id);
                          return (
                            <span
                              key={skill.id}
                              className={`px-3 py-1 rounded-lg text-sm font-medium ${
                                isMatching
                                  ? 'bg-success-100 text-success-800 border-2 border-success-400'
                                  : 'bg-neutral-100 text-neutral-700'
                              }`}
                            >
                              {isMatching && '✓ '}
                              {skill.name}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-3 pt-4 border-t border-neutral-200">
                    <Link href={`/projects/${project.id}`}>
                      <Button variant="primary">Voir le projet</Button>
                    </Link>
                    <Link href={`/profile/${project.owner_id}`}>
                      <Button variant="secondary">Voir le profil</Button>
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
