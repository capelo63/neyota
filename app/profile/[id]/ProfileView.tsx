'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

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
  mvp_development: 'Développement MVP',
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
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);

      // Get profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) throw profileError;
      setProfile(profileData);

      // Declare projectsData outside scope for stats calculation
      let projectsData: any[] = [];

      // If talent, get skills
      if (profileData.role === 'talent') {
        const { data: skillsData } = await supabase
          .from('user_skills')
          .select(
            `
            proficiency_level,
            skill:skills (
              id,
              name,
              category
            )
          `
          )
          .eq('user_id', userId);

        // Transform data to match expected format (skill is an array in response)
        const transformedSkills = (skillsData || []).map((item: any) => ({
          proficiency_level: item.proficiency_level,
          skill: Array.isArray(item.skill) ? item.skill[0] : item.skill,
        }));

        setSkills(transformedSkills);
      }

      // If entrepreneur, get projects
      if (profileData.role === 'entrepreneur') {
        const { data } = await supabase
          .from('projects')
          .select('id, title, short_pitch, current_phase, city, created_at')
          .eq('owner_id', userId)
          .order('created_at', { ascending: false });

        projectsData = data || [];
        setProjects(projectsData);
      }

      // Get stats
      const [projectsCount, applicationsCount, acceptedApplicationsCount] =
        await Promise.all([
          // Projects count
          profileData.role === 'entrepreneur'
            ? supabase
                .from('projects')
                .select('id', { count: 'exact', head: true })
                .eq('owner_id', userId)
                .then((res) => res.count || 0)
            : Promise.resolve(0),

          // Applications count (sent if talent, received if entrepreneur)
          profileData.role === 'talent'
            ? supabase
                .from('applications')
                .select('id', { count: 'exact', head: true })
                .eq('applicant_id', userId)
                .then((res) => res.count || 0)
            : supabase
                .from('applications')
                .select('id', { count: 'exact', head: true })
                .eq('project_id', { in: projectsData?.map((p) => p.id) || [] })
                .then((res) => res.count || 0),

          // Accepted applications count
          profileData.role === 'talent'
            ? supabase
                .from('applications')
                .select('id', { count: 'exact', head: true })
                .eq('applicant_id', userId)
                .eq('status', 'accepted')
                .then((res) => res.count || 0)
            : supabase
                .from('applications')
                .select('id', { count: 'exact', head: true })
                .eq('project_id', { in: projectsData?.map((p) => p.id) || [] })
                .eq('status', 'accepted')
                .then((res) => res.count || 0),
        ]);

      setStats({
        projectsCount,
        applicationsCount,
        acceptedApplicationsCount,
      });
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
        <div className="text-gray-600">Chargement du profil...</div>
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
          <p className="text-gray-600 mb-4">{error || 'Ce profil n\'existe pas'}</p>
          <Link href="/dashboard">
            <Button variant="secondary">Retour au tableau de bord</Button>
          </Link>
        </div>
      </div>
    );
  }

  const isOwnProfile = currentUserId === userId;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4">
        {/* Header with avatar and basic info */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-6">
              {/* Avatar */}
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-3xl font-bold flex-shrink-0">
                {profile.first_name[0]}
                {profile.last_name[0]}
              </div>

              {/* Basic info */}
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {profile.first_name} {profile.last_name}
                </h1>
                <div className="flex items-center gap-2 mb-3">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      profile.role === 'entrepreneur'
                        ? 'bg-orange-100 text-orange-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {profile.role === 'entrepreneur'
                      ? 'Entrepreneur'
                      : 'Talent'}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
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

            {/* Edit button if own profile */}
            {isOwnProfile && (
              <Link href="/profile/edit">
                <Button variant="secondary">Modifier mon profil</Button>
              </Link>
            )}
          </div>

          {/* Bio */}
          {profile.bio && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">
                Bio
              </h3>
              <p className="text-gray-700 whitespace-pre-wrap">{profile.bio}</p>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-3xl font-bold text-orange-600 mb-1">
              {stats.projectsCount}
            </div>
            <div className="text-gray-600">
              {profile.role === 'entrepreneur'
                ? 'Projets créés'
                : 'Projets rejoints'}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-3xl font-bold text-blue-600 mb-1">
              {stats.applicationsCount}
            </div>
            <div className="text-gray-600">
              {profile.role === 'entrepreneur'
                ? 'Candidatures reçues'
                : 'Candidatures envoyées'}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-3xl font-bold text-green-600 mb-1">
              {stats.acceptedApplicationsCount}
            </div>
            <div className="text-gray-600">
              {profile.role === 'entrepreneur'
                ? 'Collaborations actives'
                : 'Candidatures acceptées'}
            </div>
          </div>
        </div>

        {/* Skills (for talents) */}
        {profile.role === 'talent' && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Compétences
            </h2>
            {skills.length === 0 ? (
              <p className="text-gray-600">
                Aucune compétence renseignée pour le moment.
              </p>
            ) : (
              <div className="space-y-3">
                {skills.map((userSkill, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <div className="font-medium text-gray-900">
                        {userSkill.skill.name}
                      </div>
                      <div className="text-sm text-gray-500 capitalize">
                        {userSkill.skill.category}
                      </div>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        PROFICIENCY_COLORS[userSkill.proficiency_level]
                      }`}
                    >
                      {PROFICIENCY_LABELS[userSkill.proficiency_level]}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Projects (for entrepreneurs) */}
        {profile.role === 'entrepreneur' && (
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
                      <h3 className="text-lg font-semibold text-gray-900">
                        {project.title}
                      </h3>
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                        {PHASE_LABELS[project.current_phase as keyof typeof PHASE_LABELS]}
                      </span>
                    </div>
                    <p className="text-gray-700 mb-2 line-clamp-2">
                      {project.short_pitch}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      <span>{project.city}</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
