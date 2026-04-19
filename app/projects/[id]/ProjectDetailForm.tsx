'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import Link from 'next/link';
import { Button, Badge, Modal, Textarea } from '@/components/ui';
import ReportButton from '@/components/ReportButton';
import { NEED_CATEGORIES, type NeedCategoryId } from '@/lib/constants/needs-skills';

const PROJECT_PHASES = [
  { value: 'ideation', label: '💡 Idéation - Je concrétise mon idée' },
  { value: 'mvp_development', label: '🛠️ En construction - Je construis mon prototype' },
  { value: 'launch', label: '🚀 Lancement - Je lance mon produit/service' },
  { value: 'growth', label: '📈 Croissance - Je développe mon activité' },
  { value: 'scaling', label: '🌍 Structuration - Je structure et pérennise' },
];

interface ProjectDetailProps {
  projectId: string;
}

const PHASE_LABELS: Record<string, string> = {
  ideation: '💡 Idéation',
  mvp_development: '🛠️ En construction',
  launch: '🚀 Lancement',
  growth: '📈 Croissance',
  scaling: '🌍 Structuration',
};

const PHASE_COLORS: Record<string, 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info'> = {
  ideation: 'info',
  mvp_development: 'warning',
  launch: 'success',
  growth: 'primary',
  scaling: 'secondary',
};

export default function ProjectDetailForm({ projectId }: ProjectDetailProps) {
  const router = useRouter();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [project, setProject] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasApplied, setHasApplied] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState<string | null>(null);
  const [isApplicationModalOpen, setIsApplicationModalOpen] = useState(false);
  const [applicationMessage, setApplicationMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [applicationError, setApplicationError] = useState('');

  // Edition du projet (porteur uniquement)
  const [isEditing, setIsEditing] = useState(false);
  const [editPhase, setEditPhase] = useState('');
  const [editPhaseObjectives, setEditPhaseObjectives] = useState('');
  const [allNeeds, setAllNeeds] = useState<any[]>([]);
  const [needsByCategory, setNeedsByCategory] = useState<Record<string, any[]>>({});
  const [selectedNeedIds, setSelectedNeedIds] = useState<Set<string>>(new Set());
  const [expandedNeedCategories, setExpandedNeedCategories] = useState<Record<string, boolean>>({});
  const [isSavingProject, setIsSavingProject] = useState(false);
  const [editSuccess, setEditSuccess] = useState(false);

  useEffect(() => {
    loadData();
  }, [projectId]);

  const loadData = async () => {
    try {
      // Fetch user session and project data in parallel
      const [userResult, projectResult] = await Promise.all([
        supabase.auth.getUser(),
        supabase
          .from('projects')
          .select(`
            *,
            owner:profiles!owner_id(id, first_name, last_name, city, bio),
            needs:project_needs(
              need:needs(id, name, category)
            )
          `)
          .eq('id', projectId)
          .single(),
      ]);

      const currentUser = userResult.data.user;

      if (projectResult.error || !projectResult.data) {
        console.error('Error loading project:', projectResult.error);
        router.push('/projects');
        return;
      }

      const projectData = projectResult.data;
      const transformedProject = {
        ...projectData,
        owner: projectData.owner,
        needs: projectData.needs.map((n: any) => n.need).filter((n: any) => n !== null),
      };

      setProject(transformedProject);

      // Load user-specific data only if authenticated
      if (currentUser) {
        setUser(currentUser);

        // Fetch profile and application status in parallel
        const [profileResult, applicationResult] = await Promise.all([
          supabase
            .from('profiles')
            .select('*')
            .eq('id', currentUser.id)
            .single(),
          supabase
            .from('applications')
            .select('id, status')
            .eq('project_id', projectId)
            .eq('talent_id', currentUser.id)
            .maybeSingle(),
        ]);

        if (profileResult.data) {
          setProfile(profileResult.data);
        }
        setHasApplied(!!applicationResult.data);
        setApplicationStatus(applicationResult.data?.status ?? null);
      }

      setIsLoading(false);
    } catch (error) {
      console.error('Error loading data:', error);
      router.push('/projects');
    }
  };

  const openEdit = async () => {
    if (!project) return;
    setEditPhase(project.current_phase);
    setEditPhaseObjectives(project.phase_objectives || '');

    // Charger les besoins disponibles si pas encore chargés
    if (allNeeds.length === 0) {
      const { data: needsData } = await supabase.from('needs').select('*').order('sort_order');
      const needs = needsData || [];
      setAllNeeds(needs);
      const grouped = needs.reduce((acc: Record<string, any[]>, need: any) => {
        if (!acc[need.category]) acc[need.category] = [];
        acc[need.category].push(need);
        return acc;
      }, {});
      setNeedsByCategory(grouped);
      // Ouvrir toutes les catégories
      setExpandedNeedCategories(Object.keys(grouped).reduce((acc: Record<string, boolean>, k) => ({ ...acc, [k]: true }), {}));
    }

    // Pré-sélectionner les besoins actuels
    setSelectedNeedIds(new Set(project.needs.map((n: any) => n.id)));
    setIsEditing(true);
  };

  const handleSaveProject = async () => {
    if (!project) return;
    setIsSavingProject(true);
    try {
      // Mettre à jour la phase et les objectifs
      const { error: updateError } = await supabase
        .from('projects')
        .update({ current_phase: editPhase, phase_objectives: editPhaseObjectives || null })
        .eq('id', projectId);
      if (updateError) throw updateError;

      // Remplacer les besoins
      await supabase.from('project_needs').delete().eq('project_id', projectId);
      if (selectedNeedIds.size > 0) {
        const { error: needsError } = await supabase.from('project_needs').insert(
          Array.from(selectedNeedIds).map(needId => ({ project_id: projectId, need_id: needId, priority: 'essential' }))
        );
        if (needsError) throw needsError;
      }

      // Rafraîchir les données affichées
      await loadData();
      setIsEditing(false);
      setEditSuccess(true);
      setTimeout(() => setEditSuccess(false), 3000);
    } catch (err) {
      console.error('Erreur sauvegarde projet:', err);
    } finally {
      setIsSavingProject(false);
    }
  };

  const handleApply = () => {
    if (!user) {
      router.push(`/login?redirect=/projects/${projectId}`);
      return;
    }
    setIsApplicationModalOpen(true);
    setApplicationMessage('');
    setApplicationError('');
  };

  const handleSubmitApplication = async () => {
    if (!applicationMessage.trim()) {
      setApplicationError('Veuillez rédiger un message de motivation');
      return;
    }

    if (applicationMessage.trim().length < 50) {
      setApplicationError('Votre message doit contenir au moins 50 caractères');
      return;
    }

    setIsSubmitting(true);
    setApplicationError('');

    try {
      const { error } = await supabase
        .from('applications')
        .insert({
          project_id: projectId,
          talent_id: user.id,
          motivation_message: applicationMessage,
          status: 'pending',
        });

      if (error) {
        console.error('Application error:', error);
        setApplicationError('Une erreur est survenue. Veuillez réessayer.');
        setIsSubmitting(false);
        return;
      }

      setHasApplied(true);
      setIsApplicationModalOpen(false);
      setApplicationMessage('');
      setIsSubmitting(false);
    } catch (error) {
      console.error('Application error:', error);
      setApplicationError('Une erreur est survenue. Veuillez réessayer.');
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-neutral-600">Chargement du projet...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return null;
  }

  const isOwner = user?.id === project.owner_id;
  const isTalent = profile?.role === 'talent';

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200 py-4 px-4">
        <div className="container-custom">
          <div className="flex items-center justify-between">
            <Link href="/projects" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">T</span>
              </div>
              <span className="text-2xl font-bold text-neutral-900">Teriis</span>
            </Link>
            <div className="flex items-center gap-3">
              {!user && (
                <Link href={`/login?redirect=/projects/${projectId}`}>
                  <Button variant="default" size="sm">Se connecter</Button>
                </Link>
              )}
              <Link href="/projects">
                <Button variant="ghost" size="sm">← Retour aux projets</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Banner for unauthenticated users */}
      {!user && (
        <div className="bg-primary-600 text-white px-4 py-3">
          <div className="container-custom flex flex-col sm:flex-row items-center justify-between gap-3 text-sm">
            <span>
              🔒 Créez un compte gratuit pour voir la description complète et postuler à ce projet.
            </span>
            <div className="flex gap-3 shrink-0">
              <Link href={`/signup?redirect=/projects/${projectId}`}>
                <button className="bg-white text-primary-600 font-semibold px-4 py-1.5 rounded-lg hover:bg-primary-50 transition-colors text-sm">
                  Créer un compte
                </button>
              </Link>
              <Link href={`/login?redirect=/projects/${projectId}`}>
                <button className="border border-white text-white font-medium px-4 py-1.5 rounded-lg hover:bg-primary-700 transition-colors text-sm">
                  Se connecter
                </button>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 container-custom py-12">
        <div className="max-w-5xl mx-auto">
          {/* Project Header */}
          <div className="bg-white rounded-xl shadow-sm p-8 mb-6">
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <Badge variant={PHASE_COLORS[project.current_phase]}>
                    {PHASE_LABELS[project.current_phase]}
                  </Badge>
                  {project.is_remote_possible && (
                    <Badge variant="secondary">📡 Distanciel possible</Badge>
                  )}
                </div>
                <h1 className="text-4xl font-bold text-neutral-900 mb-4">
                  {project.title}
                </h1>
                <div className="flex items-center gap-4 text-neutral-600">
                  <span className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {project.city} ({project.postal_code})
                  </span>
                  <span>•</span>
                  <span>Publié le {new Date(project.created_at).toLocaleDateString('fr-FR')}</span>
                </div>
              </div>

              {/* Apply / Login CTA */}
              {!isOwner && (
                user ? (
                  isTalent && (
                    applicationStatus === 'accepted' ? (
                      <div className="px-4 py-2.5 bg-success-50 border border-success-200 rounded-lg text-success-700 font-semibold text-sm text-center">
                        Votre candidature a été acceptée ✅
                      </div>
                    ) : (
                      <Button
                        variant="default"
                        size="lg"
                        onClick={handleApply}
                        disabled={hasApplied}
                      >
                        {hasApplied ? '✓ Déjà candidaté' : 'Postuler à ce projet'}
                      </Button>
                    )
                  )
                ) : (
                  <Link href={`/login?redirect=/projects/${projectId}`}>
                    <Button variant="default" size="lg">
                      Se connecter pour postuler
                    </Button>
                  </Link>
                )
              )}
            </div>

            {/* Short Pitch — always visible */}
            <div className="mb-6 p-4 bg-primary-50 border border-primary-200 rounded-lg">
              <p className="text-lg text-neutral-800 leading-relaxed">
                {project.short_pitch}
              </p>
            </div>

            {/* Full Description — visible only when authenticated */}
            {user ? (
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-neutral-900 mb-4">
                  Description du projet
                </h2>
                <div className="prose prose-neutral max-w-none">
                  <p className="text-neutral-700 whitespace-pre-wrap leading-relaxed">
                    {project.full_description}
                  </p>
                </div>
              </div>
            ) : (
              <div className="mb-6 relative">
                <h2 className="text-2xl font-bold text-neutral-900 mb-4">
                  Description du projet
                </h2>
                {/* Blurred preview */}
                <div className="relative overflow-hidden rounded-lg">
                  <div className="blur-sm select-none pointer-events-none text-neutral-700 leading-relaxed line-clamp-4">
                    {project.full_description}
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/60 to-white flex items-end justify-center pb-4">
                    <Link href={`/login?redirect=/projects/${projectId}`}>
                      <button className="flex items-center gap-2 bg-primary-600 text-white px-5 py-2.5 rounded-lg font-semibold shadow hover:bg-primary-700 transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        Se connecter pour lire la suite
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* Phase Objectives — authenticated only */}
            {user && project.phase_objectives && (
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-neutral-900 mb-4">
                  Objectifs de cette phase
                </h2>
                <p className="text-neutral-700 whitespace-pre-wrap">
                  {project.phase_objectives}
                </p>
              </div>
            )}

            {/* Needs — always visible */}
            {project.needs.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-neutral-900 mb-4">
                  Besoins du projet
                </h2>
                <div className="grid md:grid-cols-2 gap-3">
                  {project.needs.map((need: any) => (
                    <div
                      key={need.id}
                      className="flex items-start gap-3 p-4 bg-neutral-50 rounded-lg border border-neutral-200"
                    >
                      <div className="w-2 h-2 rounded-full bg-primary-600 mt-2 flex-shrink-0"></div>
                      <div>
                        <div className="font-semibold text-neutral-900">{need.name}</div>
                        {need.category && (
                          <div className="text-sm text-neutral-600 mt-1">
                            {NEED_CATEGORIES[need.category as NeedCategoryId]?.label ?? need.category}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Owner Info */}
          <div className="bg-white rounded-xl shadow-sm p-8">
            <h2 className="text-2xl font-bold text-neutral-900 mb-6">
              À propos du porteur de projet
            </h2>
            <div className="flex items-start gap-6">
              <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-3xl">
                  {project.owner.first_name[0]}{project.owner.last_name[0]}
                </span>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-neutral-900 mb-2">
                  {project.owner.first_name} {project.owner.last_name}
                </h3>
                <div className="flex items-center gap-2 text-neutral-600 mb-4">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {project.owner.city}
                </div>
                {project.owner.bio && (
                  <p className="text-neutral-700 leading-relaxed">
                    {project.owner.bio}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Apply CTA Bottom — candidature acceptée */}
          {user && !isOwner && isTalent && applicationStatus === 'accepted' && (
            <div className="mt-8 bg-success-50 border border-success-200 rounded-xl p-6 flex items-center gap-4">
              <span className="text-3xl shrink-0">✅</span>
              <div>
                <h3 className="text-xl font-semibold text-neutral-900 mb-1">
                  Votre candidature a été acceptée !
                </h3>
                <p className="text-neutral-700">
                  Le porteur de projet vous a sélectionné. Prenez contact avec lui pour la suite.
                </p>
              </div>
            </div>
          )}

          {/* Apply CTA Bottom — non candidaté ou en attente */}
          {user && !isOwner && isTalent && applicationStatus !== 'accepted' && (
            <div className="mt-8 bg-primary-50 border border-primary-200 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-neutral-900 mb-2">
                    Ce projet vous intéresse ?
                  </h3>
                  <p className="text-neutral-700">
                    Postulez maintenant et proposez vos compétences pour contribuer à ce projet local.
                  </p>
                </div>
                <Button
                  variant="default"
                  size="lg"
                  onClick={handleApply}
                  disabled={hasApplied}
                >
                  {hasApplied ? '✓ Déjà candidaté' : 'Postuler'}
                </Button>
              </div>
            </div>
          )}

          {/* Signup CTA Bottom — unauthenticated only */}
          {!user && (
            <div className="mt-8 bg-gradient-to-br from-primary-600 to-primary-700 rounded-xl p-8 text-white text-center">
              <h3 className="text-2xl font-bold mb-3">
                Intéressé par ce projet ?
              </h3>
              <p className="text-primary-100 mb-6">
                Créez votre compte gratuitement pour lire la description complète et postuler en quelques minutes.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href={`/signup?redirect=/projects/${projectId}`}>
                  <Button variant="secondary" size="lg" className="min-w-[180px] bg-white text-primary-600 hover:bg-neutral-50">
                    Créer un compte
                  </Button>
                </Link>
                <Link href={`/login?redirect=/projects/${projectId}`}>
                  <Button variant="ghost" size="lg" className="min-w-[180px] text-white border-white hover:bg-primary-700">
                    Se connecter
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {/* Report button — authenticated non-owners only */}
          {user && !isOwner && (
            <div className="mt-4 flex justify-end">
              <ReportButton
                targetType="project"
                targetId={projectId}
                targetName={project?.title}
                currentUserId={user.id}
              />
            </div>
          )}

          {/* Owner view */}
          {isOwner && (
            <div className="mt-8 space-y-4">
              {editSuccess && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-green-800 text-sm font-medium">
                  ✅ Projet mis à jour avec succès.
                </div>
              )}

              <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-6">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <h3 className="text-xl font-semibold text-neutral-900 mb-1">Gestion du projet</h3>
                    <p className="text-neutral-600 text-sm">Mettez à jour la phase et les besoins au fil de l'avancement.</p>
                  </div>
                  <div className="flex gap-3">
                    <Link href={`/projects/${projectId}/applications`}>
                      <Button variant="secondary" size="sm">Voir les candidatures</Button>
                    </Link>
                    <Button variant="default" size="sm" onClick={openEdit}>
                      ✏️ Modifier le projet
                    </Button>
                  </div>
                </div>
              </div>

              {isEditing && (
                <div className="bg-white border border-primary-200 rounded-xl p-6 space-y-6">
                  <h3 className="text-lg font-semibold text-neutral-900">Modifier le projet</h3>

                  {/* Phase */}
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">Phase actuelle</label>
                    <select
                      value={editPhase}
                      onChange={(e) => setEditPhase(e.target.value)}
                      className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      {PROJECT_PHASES.map(p => (
                        <option key={p.value} value={p.value}>{p.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Objectifs de phase */}
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Objectifs de cette phase <span className="text-neutral-400">(optionnel)</span>
                    </label>
                    <textarea
                      value={editPhaseObjectives}
                      onChange={(e) => setEditPhaseObjectives(e.target.value)}
                      rows={3}
                      maxLength={500}
                      placeholder="Décrivez ce que vous souhaitez accomplir dans cette phase..."
                      className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  {/* Besoins */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="block text-sm font-medium text-neutral-700">Besoins du projet</label>
                      <span className="text-xs text-neutral-500">{selectedNeedIds.size} sélectionné{selectedNeedIds.size > 1 ? 's' : ''}</span>
                    </div>

                    <div className="space-y-2">
                      {Object.entries(needsByCategory).map(([categoryId, categoryNeeds]) => {
                        const categoryInfo = NEED_CATEGORIES[categoryId as NeedCategoryId];
                        const isExpanded = expandedNeedCategories[categoryId];
                        const selectedCount = categoryNeeds.filter((n: any) => selectedNeedIds.has(n.id)).length;
                        if (!categoryInfo) return null;

                        return (
                          <div key={categoryId} className="border border-neutral-200 rounded-lg overflow-hidden">
                            <button
                              type="button"
                              onClick={() => setExpandedNeedCategories(prev => ({ ...prev, [categoryId]: !prev[categoryId] }))}
                              className="w-full px-4 py-2.5 bg-neutral-50 hover:bg-neutral-100 transition-colors flex items-center justify-between text-left"
                            >
                              <div className="flex items-center gap-2 flex-1">
                                <span>{categoryInfo.icon}</span>
                                <span className="font-medium text-sm text-neutral-900">{categoryInfo.label}</span>
                                {selectedCount > 0 && (
                                  <span className="px-2 py-0.5 bg-primary-100 text-primary-700 text-xs font-medium rounded-full">{selectedCount}</span>
                                )}
                              </div>
                              <svg className={`w-4 h-4 text-neutral-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </button>

                            {isExpanded && (
                              <div className="p-3 space-y-1 bg-white">
                                {categoryNeeds.map((need: any) => {
                                  const isSelected = selectedNeedIds.has(need.id);
                                  return (
                                    <label key={need.id} className={`flex items-center gap-3 p-2.5 rounded-lg cursor-pointer transition-all ${
                                      isSelected ? 'bg-primary-50 border border-primary-200' : 'hover:bg-neutral-50 border border-transparent'
                                    }`}>
                                      <input
                                        type="checkbox"
                                        checked={isSelected}
                                        onChange={() => setSelectedNeedIds(prev => {
                                          const next = new Set(prev);
                                          next.has(need.id) ? next.delete(need.id) : next.add(need.id);
                                          return next;
                                        })}
                                        className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                                      />
                                      <span className="text-sm text-neutral-900">{need.name}</span>
                                    </label>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button variant="ghost" onClick={() => setIsEditing(false)} disabled={isSavingProject} className="flex-1">
                      Annuler
                    </Button>
                    <Button variant="default" onClick={handleSaveProject} disabled={isSavingProject} className="flex-1">
                      {isSavingProject ? 'Enregistrement...' : 'Enregistrer les modifications'}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Application Modal */}
      <Modal
        isOpen={isApplicationModalOpen}
        onClose={() => setIsApplicationModalOpen(false)}
        title="Postuler à ce projet"
        size="lg"
      >
        <div className="space-y-6">
          <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
            <h3 className="font-semibold text-neutral-900 mb-2">{project?.title}</h3>
            <p className="text-sm text-neutral-700">
              Vous postulez auprès de {project?.owner.first_name} {project?.owner.last_name}
            </p>
          </div>

          {applicationError && (
            <div className="bg-error-50 border border-error-200 text-error-700 px-4 py-3 rounded-lg text-sm">
              {applicationError}
            </div>
          )}

          <Textarea
            label="Message de motivation"
            placeholder="Expliquez pourquoi ce projet vous intéresse et comment vos compétences peuvent contribuer à sa réussite..."
            value={applicationMessage}
            onChange={(e) => setApplicationMessage(e.target.value)}
            rows={8}
            maxLength={1000}
            helperText={`${applicationMessage.length}/1000 caractères (minimum 50)`}
            required
          />

          <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4">
            <h4 className="font-semibold text-neutral-900 mb-2">
              📋 Informations partagées avec le porteur d'initiative
            </h4>
            <ul className="text-sm text-neutral-700 space-y-1">
              <li>• Votre nom et prénom</li>
              <li>• Votre message de motivation</li>
              <li>• Vos compétences</li>
              <li>• Votre localisation</li>
              <li>• Votre profil complet</li>
            </ul>
          </div>

          <div className="flex gap-4 pt-4">
            <Button
              variant="ghost"
              className="flex-1"
              onClick={() => setIsApplicationModalOpen(false)}
              disabled={isSubmitting}
            >
              Annuler
            </Button>
            <Button
              variant="default"
              className="flex-1"
              onClick={handleSubmitApplication}
              isLoading={isSubmitting}
              disabled={isSubmitting || applicationMessage.trim().length < 50}
            >
              Envoyer ma candidature
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
