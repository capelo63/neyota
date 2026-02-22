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
  phase_objectives: string | null;
  city: string;
  postal_code: string;
  region: string | null;
  is_remote_possible: boolean;
  preferred_radius_km: number;
  status: string;
  created_at: string;
  owner_id: string;
}

interface Skill {
  id: number;
  name: string;
  category: string;
}

interface Owner {
  id: string;
  first_name: string;
  last_name: string;
  avatar_url: string | null;
  city: string;
  role: string;
}

const PHASE_LABELS: Record<string, string> = {
  ideation: 'Idéation',
  mvp_development: 'En construction',
  launch: 'Lancement',
  growth: 'Croissance',
  scaling: 'Structuration',
};

const PHASE_DESCRIPTIONS: Record<string, string> = {
  ideation: 'Exploration et validation de l\'idée',
  mvp_development: 'Construction du produit minimum viable',
  launch: 'Mise sur le marché',
  growth: 'Acquisition et fidélisation',
  scaling: 'Structuration et développement',
};

export default function ProjectDetails({ projectId }: { projectId: string }) {
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [owner, setOwner] = useState<Owner | null>(null);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [currentUserProfile, setCurrentUserProfile] = useState<any>(null);
  const [hasApplied, setHasApplied] = useState(false);
  const [applicationsCount, setApplicationsCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isApplying, setIsApplying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    loadProjectData();
  }, [projectId]);

  const loadProjectData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setCurrentUser(user);

      if (user) {
        // Get current user profile
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        setCurrentUserProfile(profileData);
      }

      // Get project
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single();

      if (projectError) {
        console.error('Project error:', projectError);
        setError('Projet introuvable');
        setIsLoading(false);
        return;
      }

      setProject(projectData);

      // Get owner
      const { data: ownerData } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, avatar_url, city, role')
        .eq('id', projectData.owner_id)
        .single();

      setOwner(ownerData);

      // Get skills
      const { data: skillsData } = await supabase
        .from('project_skills_needed')
        .select(`
          skill:skills (
            id,
            name,
            category
          )
        `)
        .eq('project_id', projectId);

      const transformedSkills = (skillsData || [])
        .map((item: any) => (Array.isArray(item.skill) ? item.skill[0] : item.skill))
        .filter(Boolean);

      setSkills(transformedSkills);

      // Get applications count
      const { count } = await supabase
        .from('applications')
        .select('id', { count: 'exact', head: true })
        .eq('project_id', projectId);

      setApplicationsCount(count || 0);

      // Check if current user has applied
      if (user) {
        const { data: applicationData } = await supabase
          .from('applications')
          .select('id')
          .eq('project_id', projectId)
          .eq('talent_id', user.id)
          .maybeSingle();

        setHasApplied(!!applicationData);
      }

      setIsLoading(false);
    } catch (err: any) {
      console.error('Error loading project:', err);
      setError(err.message || 'Erreur lors du chargement du projet');
      setIsLoading(false);
    }
  };

  const handleApply = async () => {
    if (!currentUser) {
      router.push('/login');
      return;
    }

    if (currentUserProfile?.role !== 'talent') {
      alert('Seuls les talents peuvent postuler aux projets');
      return;
    }

    setIsApplying(true);

    try {
      const { error: applicationError } = await supabase
        .from('applications')
        .insert({
          project_id: projectId,
          talent_id: currentUser.id,
          status: 'pending',
          message: 'Candidature envoyée depuis la page projet',
        });

      if (applicationError) {
        console.error('Application error:', applicationError);
        alert('Erreur lors de l\'envoi de la candidature');
        setIsApplying(false);
        return;
      }

      setHasApplied(true);
      setApplicationsCount((prev) => prev + 1);
      alert('✅ Candidature envoyée avec succès !');
    } catch (err: any) {
      console.error('Error applying:', err);
      alert('Erreur lors de l\'envoi de la candidature');
    } finally {
      setIsApplying(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-neutral-600">Chargement du projet...</p>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-neutral-900 mb-2">
            Projet introuvable
          </h2>
          <p className="text-neutral-600 mb-4">
            {error || 'Ce projet n\'existe pas'}
          </p>
          <Link href="/projects">
            <Button variant="secondary">Retour aux projets</Button>
          </Link>
        </div>
      </div>
    );
  }

  const isOwner = currentUser?.id === project.owner_id;

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200 py-4 px-4">
        <div className="container-custom">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">T</span>
              </div>
              <span className="text-2xl font-bold text-neutral-900">TERRII</span>
            </Link>
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                ← Retour
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container-custom py-8">
        <div className="max-w-5xl mx-auto">
          {/* Project Header */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <h1 className="text-3xl font-bold text-neutral-900">
                    {project.title}
                  </h1>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      project.status === 'active'
                        ? 'bg-success-100 text-success-700'
                        : 'bg-neutral-100 text-neutral-700'
                    }`}
                  >
                    {project.status === 'active' ? 'Actif' : 'Inactif'}
                  </span>
                </div>
                <p className="text-xl text-neutral-700 mb-4">
                  {project.short_pitch}
                </p>
              </div>
            </div>

            {/* Project Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="flex items-center gap-2 text-neutral-600">
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
                  {project.city} ({project.postal_code})
                  {project.region && ` • ${project.region}`}
                </span>
              </div>
              <div className="flex items-center gap-2 text-neutral-600">
                <span className="text-2xl">📊</span>
                <span>
                  Phase : {PHASE_LABELS[project.current_phase]}
                </span>
              </div>
              <div className="flex items-center gap-2 text-neutral-600">
                <span className="text-2xl">📍</span>
                <span>
                  Rayon : {project.preferred_radius_km} km
                  {project.is_remote_possible && ' • Télétravail possible'}
                </span>
              </div>
            </div>

            {/* Phase Description */}
            <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-neutral-900 mb-1">
                Phase actuelle : {PHASE_LABELS[project.current_phase]}
              </h3>
              <p className="text-sm text-neutral-600">
                {PHASE_DESCRIPTIONS[project.current_phase]}
              </p>
            </div>

            {/* Apply Button or Manage Button */}
            {isOwner ? (
              <div className="flex gap-3">
                <Link href={`/projects/${project.id}/applications`}>
                  <Button variant="primary" size="lg">
                    📨 Gérer les candidatures ({applicationsCount})
                  </Button>
                </Link>
                <Link href={`/projects/${project.id}/edit`}>
                  <Button variant="secondary" size="lg">
                    ✏️ Modifier le projet
                  </Button>
                </Link>
              </div>
            ) : hasApplied ? (
              <Button variant="secondary" size="lg" disabled>
                ✅ Candidature déjà envoyée
              </Button>
            ) : (
              <Button
                variant="primary"
                size="lg"
                onClick={handleApply}
                disabled={isApplying}
              >
                {isApplying ? 'Envoi en cours...' : '🚀 Postuler à ce projet'}
              </Button>
            )}
          </div>

          {/* Description */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h2 className="text-2xl font-bold text-neutral-900 mb-4">
              Description complète
            </h2>
            <p className="text-neutral-700 whitespace-pre-wrap">
              {project.full_description}
            </p>
          </div>

          {/* Phase Objectives */}
          {project.phase_objectives && (
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <h2 className="text-2xl font-bold text-neutral-900 mb-4">
                Objectifs de la phase
              </h2>
              <p className="text-neutral-700 whitespace-pre-wrap">
                {project.phase_objectives}
              </p>
            </div>
          )}

          {/* Skills Needed */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h2 className="text-2xl font-bold text-neutral-900 mb-4">
              Compétences recherchées
            </h2>
            {skills.length === 0 ? (
              <p className="text-neutral-600">
                Aucune compétence spécifique requise
              </p>
            ) : (
              <div className="flex flex-wrap gap-3">
                {skills.map((skill) => (
                  <div
                    key={skill.id}
                    className="px-4 py-2 bg-primary-100 text-primary-800 rounded-lg font-medium"
                  >
                    {skill.name}
                    <span className="text-xs text-primary-600 ml-2 capitalize">
                      ({skill.category})
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Owner Info */}
          {owner && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-2xl font-bold text-neutral-900 mb-4">
                Porteur de projet
              </h2>
              <Link
                href={`/profile/${owner.id}`}
                className="flex items-center gap-4 p-4 bg-neutral-50 rounded-lg hover:bg-neutral-100 transition-colors"
              >
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                  {owner.first_name[0]}
                  {owner.last_name[0]}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-neutral-900">
                    {owner.first_name} {owner.last_name}
                  </h3>
                  <p className="text-neutral-600">Entrepreneur • {owner.city}</p>
                </div>
                <svg
                  className="w-5 h-5 text-neutral-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
