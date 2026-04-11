'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { BadgeGrid, type BadgeType } from '@/components/badges/Badge';
import { ImpactStats } from '@/components/badges/ImpactStats';
import ReportButton from '@/components/ReportButton';
import InviteTalentModal from '@/components/InviteTalentModal';

interface Profile {
  id: string;
  role: 'entrepreneur' | 'talent';
  first_name: string;
  last_name: string;
  avatar_url: string | null;
  bio: string | null;
  postal_code: string;
  city: string;
  region: string | null;
  country: string;
  max_distance_km: number;
  created_at: string;
}

interface UserSkill {
  skill: {
    id: string;
    name: string;
    category: string;
  };
  proficiency_level: 'beginner' | 'intermediate' | 'expert';
}

interface Project {
  id: string;
  title: string;
  short_pitch: string;
  current_phase: string;
  city: string;
  created_at: string;
}

interface Stats {
  projectsCount: number;
  applicationsCount: number;
  acceptedApplicationsCount: number;
}

interface UserBadge {
  badge_type: BadgeType;
  earned_at: string;
}

interface ImpactStats {
  projects_helped?: number;
  hours_contributed?: number;
  impact_score: number;
  average_rating?: number;
  total_ratings?: number;
  projects_created?: number;
  talents_recruited?: number;
}

const PROFICIENCY_LABELS = {
  beginner: 'Débutant',
  intermediate: 'Intermédiaire',
  expert: 'Expert',
};

const PROFICIENCY_COLORS = {
  beginner: 'bg-blue-100 text-blue-800',
  intermediate: 'bg-purple-100 text-purple-800',
  expert: 'bg-orange-100 text-orange-800',
};

const PHASE_LABELS = {
  ideation: 'Idéation',
  mvp_development: 'En construction',
  launch: 'Lancement',
  growth: 'Croissance',
  scaling: 'Structuration',
};

export default function ProfileView({ userId }: { userId: string }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [skills, setSkills] = useState<UserSkill[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [stats, setStats] = useState<Stats>({
    projectsCount: 0,
    applicationsCount: 0,
    acceptedApplicationsCount: 0,
  });
  const [badges, setBadges] = useState<UserBadge[]>([]);
  const [impactStats, setImpactStats] = useState<ImpactStats | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentUserProfile, setCurrentUserProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showInviteModal, setShowInviteModal] = useState(false);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    loadData();
  }, [userId]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // 1. Fetch user session + target profile in parallel
      const [userResult, profileResult] = await Promise.all([
        supabase.auth.getUser(),
        supabase.from('profiles').select('*').eq('id', userId).single(),
      ]);

      const user = userResult.data.user;
      setCurrentUserId(user?.id || null);

      if (profileResult.error) throw profileResult.error;
      const profileData = profileResult.data;
      setProfile(profileData);

      // 2. All secondary data in parallel (no more sequential hops)
      const [
        currentProfileResult,
        skillsResult,
        projectsResult,
        projectsCountResult,
        applicationsCountResult,
        acceptedCountResult,
        badgesResult,
        impactResult,
      ] = await Promise.all([
        // Current user's profile (needed for invite button logic)
        user
          ? supabase.from('profiles').select('*').eq('id', user.id).single()
          : Promise.resolve({ data: null, error: null }),

        // Viewed profile's skills (talent only)
        profileData.role === 'talent'
          ? supabase
              .from('user_skills')
              .select(`proficiency_level, skill:skills (id, name, category)`)
              .eq('user_id', userId)
          : Promise.resolve({ data: [], error: null }),

        // Viewed profile's projects (entrepreneur only)
        profileData.role === 'entrepreneur'
          ? supabase
              .from('projects')
              .select('id, title, short_pitch, current_phase, city, created_at')
              .eq('owner_id', userId)
              .order('created_at', { ascending: false })
          : Promise.resolve({ data: [], error: null }),

        // Projects count
        profileData.role === 'entrepreneur'
          ? supabase
              .from('projects')
              .select('id', { count: 'exact', head: true })
              .eq('owner_id', userId)
              .then((res) => res.count || 0)
          : Promise.resolve(0),

        // Applications count
        profileData.role === 'talent'
          ? supabase
              .from('applications')
              .select('id', { count: 'exact', head: true })
              .eq('talent_id', userId)
              .then((res) => res.count || 0)
          : Promise.resolve(0),

        // Accepted count
        profileData.role === 'talent'
          ? supabase
              .from('applications')
              .select('id', { count: 'exact', head: true })
              .eq('talent_id', userId)
              .eq('status', 'accepted')
              .then((res) => res.count || 0)
          : Promise.resolve(0),

        // Badges
        supabase
          .from('user_badges')
          .select('badge_type, earned_at')
          .eq('user_id', userId)
          .order('earned_at', { ascending: false }),

        // Impact stats
        supabase
          .from('user_impact_stats')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle(),
      ]);

      if ((currentProfileResult as any).data) {
        setCurrentUserProfile((currentProfileResult as any).data);
      }

      // Transform skills
      const rawSkills = ((skillsResult as any).data || []) as any[];
      setSkills(
        rawSkills.map((item) => ({
          proficiency_level: item.proficiency_level,
          skill: Array.isArray(item.skill) ? item.skill[0] : item.skill,
        }))
      );

      setProjects(((projectsResult as any).data || []) as Project[]);

      // For entrepreneurs, application counts need project IDs
      let finalAppsCount = applicationsCountResult as number;
      let finalAcceptedCount = acceptedCountResult as number;
      if (profileData.role === 'entrepreneur') {
        const projectIds = ((projectsResult as any).data || []).map((p: any) => p.id);
        if (projectIds.length > 0) {
          const [appCount, accCount] = await Promise.all([
            supabase
              .from('applications')
              .select('id', { count: 'exact', head: true })
              .in('project_id', projectIds)
              .then((res) => res.count || 0),
            supabase
              .from('applications')
              .select('id', { count: 'exact', head: true })
              .in('project_id', projectIds)
              .eq('status', 'accepted')
              .then((res) => res.count || 0),
          ]);
          finalAppsCount = appCount;
          finalAcceptedCount = accCount;
        }
      }

      setStats({
        projectsCount: projectsCountResult as number,
        applicationsCount: finalAppsCount,
        acceptedApplicationsCount: finalAcceptedCount,
      });

      setBadges(((badgesResult as any).data || []) as UserBadge[]);
      if ((impactResult as any).data) {
        setImpactStats((impactResult as any).data);
      }
    } catch (err: any) {
      console.error('Error loading profile:', err);
      setError(err.message || 'Erreur lors du chargement du profil');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-neutral-600">Chargement du profil...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Profil introuvable
          </h2>
          <p className="text-gray-600 mb-4">{error || "Ce profil n'existe pas"}</p>
          <Link href={currentUserId ? '/dashboard' : '/talents'}>
            <Button variant="secondary">
              {currentUserId ? 'Retour au tableau de bord' : 'Voir tous les talents'}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const isOwnProfile = currentUserId === userId;
  const isAuthenticatedEntrepreneur =
    !!currentUserId && currentUserProfile?.role === 'entrepreneur';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header — always visible, adapts to auth state */}
      <header className="bg-white border-b border-neutral-200 py-4 px-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">T</span>
            </div>
            <span className="text-2xl font-bold text-neutral-900">Teriis</span>
          </Link>
          {!currentUserId && (
            <div className="flex items-center gap-3">
              <Link href={`/login?redirect=/profile/${userId}`}>
                <Button variant="ghost" size="sm">Se connecter</Button>
              </Link>
              <Link href={`/signup?redirect=/profile/${userId}`}>
                <Button variant="primary" size="sm">Créer un compte</Button>
              </Link>
            </div>
          )}
          {currentUserId && (
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">← Tableau de bord</Button>
            </Link>
          )}
        </div>
      </header>

      {/* Banner for unauthenticated visitors viewing a talent profile */}
      {!currentUserId && profile.role === 'talent' && (
        <div className="bg-primary-600 text-white px-4 py-3">
          <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-sm">
            <span>
              🔒 Créez un compte entrepreneur gratuit pour inviter ce talent à rejoindre votre projet.
            </span>
            <div className="flex gap-3 shrink-0">
              <Link href={`/signup?role=entrepreneur&redirect=/profile/${userId}`}>
                <button className="bg-white text-primary-600 font-semibold px-4 py-1.5 rounded-lg hover:bg-primary-50 transition-colors text-sm">
                  Créer un compte
                </button>
              </Link>
              <Link href={`/login?redirect=/profile/${userId}`}>
                <button className="border border-white text-white font-medium px-4 py-1.5 rounded-lg hover:bg-primary-700 transition-colors text-sm">
                  Se connecter
                </button>
              </Link>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header card with avatar and basic info */}
        <div className="bg-white rounded-lg shadow-md p-5 md:p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex items-start gap-4">
              {/* Avatar */}
              <div className="w-16 h-16 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-2xl md:text-3xl font-bold flex-shrink-0">
                {profile.first_name[0]}
                {profile.last_name[0]}
              </div>

              {/* Basic info */}
              <div className="min-w-0">
                <h1 className="text-xl md:text-3xl font-bold text-gray-900 mb-2 break-words">
                  {profile.first_name} {profile.last_name}
                </h1>
                <div className="flex items-center gap-2 mb-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    profile.role === 'entrepreneur'
                      ? 'bg-orange-100 text-orange-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {profile.role === 'entrepreneur' ? 'Porteur d\'initiative' : 'Talent'}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 text-sm">
                  <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>
                    {profile.city}, {profile.postal_code}
                    {profile.region && ` • ${profile.region}`}
                  </span>
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  Rayon de recherche : {profile.max_distance_km} km
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-row sm:flex-col gap-2 shrink-0">
              {isOwnProfile && (
                <>
                  <Link href="/dashboard">
                    <Button variant="primary" size="sm">Dashboard</Button>
                  </Link>
                  <Link href="/profile/edit">
                    <Button variant="secondary" size="sm">Modifier</Button>
                  </Link>
                </>
              )}

              {/* Invite button — authenticated entrepreneur viewing a talent */}
              {!isOwnProfile && isAuthenticatedEntrepreneur && profile.role === 'talent' && (
                <Button variant="primary" size="sm" onClick={() => setShowInviteModal(true)}>
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Inviter
                </Button>
              )}

              {/* Login CTA — unauthenticated visitor viewing a talent */}
              {!currentUserId && profile.role === 'talent' && (
                <Link href={`/login?redirect=/profile/${userId}`}>
                  <Button variant="primary" size="sm">
                    Se connecter pour inviter
                  </Button>
                </Link>
              )}
            </div>
          </div>

          {/* Bio */}
          {profile.bio && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Bio</h3>
              <p className="text-gray-700 whitespace-pre-wrap">{profile.bio}</p>
            </div>
          )}

          {/* Report button — only for authenticated users viewing other profiles */}
          {!isOwnProfile && currentUserId && (
            <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end">
              <ReportButton
                targetType="profile"
                targetId={userId}
                targetName={`${profile.first_name} ${profile.last_name}`}
                currentUserId={currentUserId}
              />
            </div>
          )}
        </div>

        {/* Own profile — link to dashboard */}
        {isOwnProfile && (
          <div className="bg-gradient-to-br from-primary-50 to-primary-100 border-2 border-primary-200 rounded-xl p-5 md:p-6 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-neutral-900 mb-2">
                  💡 Ceci est votre profil public
                </h2>
                <p className="text-neutral-700">
                  Consultez votre <strong>dashboard</strong> pour vos statistiques, badges et impact en temps réel.
                </p>
              </div>
              <Link href="/dashboard" className="shrink-0">
                <Button variant="primary">Voir mon dashboard →</Button>
              </Link>
            </div>
          </div>
        )}

        {/* Stats — other profiles only */}
        {!isOwnProfile && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-3xl font-bold text-orange-600 mb-1">{stats.projectsCount}</div>
              <div className="text-gray-600">
                {profile.role === 'entrepreneur' ? 'Projets créés' : 'Projets rejoints'}
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-3xl font-bold text-blue-600 mb-1">{stats.applicationsCount}</div>
              <div className="text-gray-600">
                {profile.role === 'entrepreneur' ? 'Candidatures reçues' : 'Candidatures envoyées'}
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-3xl font-bold text-green-600 mb-1">{stats.acceptedApplicationsCount}</div>
              <div className="text-gray-600">
                {profile.role === 'entrepreneur' ? 'Collaborations actives' : 'Candidatures acceptées'}
              </div>
            </div>
          </div>
        )}

        {/* Badges — other profiles only */}
        {!isOwnProfile && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Badges obtenus</h2>
            <BadgeGrid badges={badges} />
          </div>
        )}

        {/* Impact Stats — other profiles only */}
        {!isOwnProfile && impactStats && (
          <div className="mb-6">
            <ImpactStats stats={impactStats} role={profile.role} />
          </div>
        )}

        {/* Skills (talents) — other profiles only */}
        {!isOwnProfile && profile.role === 'talent' && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Compétences</h2>
            {skills.length === 0 ? (
              <p className="text-gray-600">Aucune compétence renseignée pour le moment.</p>
            ) : (
              <div className="space-y-3">
                {skills.map((userSkill, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <div className="font-medium text-gray-900">{userSkill.skill.name}</div>
                      <div className="text-sm text-gray-500 capitalize">{userSkill.skill.category}</div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${PROFICIENCY_COLORS[userSkill.proficiency_level]}`}>
                      {PROFICIENCY_LABELS[userSkill.proficiency_level]}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Projects (entrepreneurs) — other profiles only */}
        {!isOwnProfile && profile.role === 'entrepreneur' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Projets</h2>
            {projects.length === 0 ? (
              <p className="text-gray-600">Aucun projet créé pour le moment.</p>
            ) : (
              <div className="space-y-4">
                {projects.map((project) => (
                  <Link
                    key={project.id}
                    href={`/projects/${project.id}`}
                    className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{project.title}</h3>
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                        {PHASE_LABELS[project.current_phase as keyof typeof PHASE_LABELS]}
                      </span>
                    </div>
                    <p className="text-gray-700 mb-2 line-clamp-2">{project.short_pitch}</p>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span>{project.city}</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Signup CTA at bottom — unauthenticated visitors only */}
        {!currentUserId && (
          <div className="mt-8 bg-gradient-to-br from-primary-600 to-primary-700 rounded-xl p-8 text-white text-center">
            <h3 className="text-2xl font-bold mb-3">
              {profile.role === 'talent'
                ? 'Vous cherchez des talents pour votre projet ?'
                : 'Vous souhaitez collaborer avec cet entrepreneur ?'}
            </h3>
            <p className="text-primary-100 mb-6">
              Rejoignez Teriis gratuitement pour entrer en contact et collaborer sur des projets locaux.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href={`/signup?redirect=/profile/${userId}`}>
                <Button variant="secondary" size="lg" className="min-w-[180px] bg-white text-primary-600 hover:bg-neutral-50">
                  Créer un compte
                </Button>
              </Link>
              <Link href={`/login?redirect=/profile/${userId}`}>
                <Button variant="ghost" size="lg" className="min-w-[180px] text-white border-white hover:bg-primary-700">
                  Se connecter
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Invite Talent Modal */}
      {profile && (
        <InviteTalentModal
          talentId={userId}
          talentName={`${profile.first_name} ${profile.last_name}`}
          isOpen={showInviteModal}
          onClose={() => setShowInviteModal(false)}
          onSuccess={() => {
            alert('Invitation envoyée avec succès !');
          }}
        />
      )}
    </div>
  );
}
