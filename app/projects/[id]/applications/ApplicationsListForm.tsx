'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import Link from 'next/link';
import { Button, Badge } from '@/components/ui';

interface ApplicationsListProps {
  projectId: string;
}

export default function ApplicationsListForm({ projectId }: ApplicationsListProps) {
  const router = useRouter();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [user, setUser] = useState<any>(null);
  const [project, setProject] = useState<any>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [projectId]);

  const loadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
        return;
      }

      setUser(user);

      // Load project
      const { data: projectData } = await supabase
        .from('projects')
        .select('id, title, owner_id')
        .eq('id', projectId)
        .single();

      if (!projectData || projectData.owner_id !== user.id) {
        router.push('/dashboard');
        return;
      }

      setProject(projectData);

      // Load applications
      const { data: applicationsData } = await supabase
        .from('applications')
        .select(`
          *,
          applicant:profiles!applicant_id(
            id, first_name, last_name, email, city, bio,
            skills:user_skills(
              skill:skills(id, name)
            )
          )
        `)
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (applicationsData) {
        const transformedApplications = applicationsData.map((app: any) => ({
          ...app,
          applicant: {
            ...app.applicant,
            skills: app.applicant.skills.map((s: any) => s.skill).filter((s: any) => s !== null),
          },
        }));
        setApplications(transformedApplications);
      }

      setIsLoading(false);
    } catch (error) {
      console.error('Error loading data:', error);
      router.push('/dashboard');
    }
  };

  const handleUpdateStatus = async (applicationId: string, newStatus: 'accepted' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('applications')
        .update({ status: newStatus })
        .eq('id', applicationId);

      if (error) {
        console.error('Error updating status:', error);
        return;
      }

      // Reload applications
      loadData();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-neutral-600">Chargement...</p>
        </div>
      </div>
    );
  }

  const pendingApplications = applications.filter(app => app.status === 'pending');
  const acceptedApplications = applications.filter(app => app.status === 'accepted');
  const rejectedApplications = applications.filter(app => app.status === 'rejected');

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200 py-4 px-4">
        <div className="container-custom">
          <div className="flex items-center justify-between">
            <Link href={`/projects/${projectId}`} className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">N</span>
              </div>
              <span className="text-2xl font-bold text-neutral-900">NEYOTA</span>
            </Link>
            <Link href={`/projects/${projectId}`}>
              <Button variant="ghost" size="sm">
                ← Retour au projet
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container-custom py-12">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-neutral-900 mb-2">
              Candidatures
            </h1>
            <p className="text-neutral-600">
              Projet : {project?.title}
            </p>
          </div>

          {/* Stats */}
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white rounded-lg p-6 border border-neutral-200">
              <div className="text-3xl font-bold text-warning-600 mb-1">
                {pendingApplications.length}
              </div>
              <div className="text-sm text-neutral-600">En attente</div>
            </div>
            <div className="bg-white rounded-lg p-6 border border-neutral-200">
              <div className="text-3xl font-bold text-success-600 mb-1">
                {acceptedApplications.length}
              </div>
              <div className="text-sm text-neutral-600">Acceptées</div>
            </div>
            <div className="bg-white rounded-lg p-6 border border-neutral-200">
              <div className="text-3xl font-bold text-neutral-400 mb-1">
                {rejectedApplications.length}
              </div>
              <div className="text-sm text-neutral-600">Refusées</div>
            </div>
          </div>

          {/* Applications List */}
          {applications.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center">
              <div className="text-6xl mb-4">📭</div>
              <h3 className="text-xl font-semibold text-neutral-900 mb-2">
                Aucune candidature pour le moment
              </h3>
              <p className="text-neutral-600">
                Les talents intéressés par votre projet pourront postuler depuis la page du projet.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Pending Applications */}
              {pendingApplications.length > 0 && (
                <div>
                  <h2 className="text-2xl font-bold text-neutral-900 mb-4">
                    En attente de réponse ({pendingApplications.length})
                  </h2>
                  <div className="space-y-4">
                    {pendingApplications.map((application) => (
                      <div key={application.id} className="bg-white rounded-xl shadow-sm p-6 border border-neutral-200">
                        <div className="flex items-start gap-6">
                          <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-white font-bold text-2xl">
                              {application.applicant.first_name[0]}{application.applicant.last_name[0]}
                            </span>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <h3 className="text-xl font-semibold text-neutral-900">
                                  {application.applicant.first_name} {application.applicant.last_name}
                                </h3>
                                <p className="text-sm text-neutral-600">
                                  {application.applicant.city} • Candidature du {new Date(application.created_at).toLocaleDateString('fr-FR')}
                                </p>
                              </div>
                              <Badge variant="warning">En attente</Badge>
                            </div>

                            {application.applicant.skills.length > 0 && (
                              <div className="flex flex-wrap gap-2 mb-4">
                                {application.applicant.skills.slice(0, 5).map((skill: any) => (
                                  <Badge key={skill.id} variant="secondary">
                                    {skill.name}
                                  </Badge>
                                ))}
                                {application.applicant.skills.length > 5 && (
                                  <Badge variant="secondary">
                                    +{application.applicant.skills.length - 5}
                                  </Badge>
                                )}
                              </div>
                            )}

                            <div className="bg-neutral-50 rounded-lg p-4 mb-4">
                              <p className="text-sm font-semibold text-neutral-900 mb-2">Message de motivation :</p>
                              <p className="text-neutral-700 whitespace-pre-wrap">
                                {application.message}
                              </p>
                            </div>

                            <div className="flex gap-3">
                              <Button
                                variant="primary"
                                onClick={() => handleUpdateStatus(application.id, 'accepted')}
                              >
                                ✓ Accepter
                              </Button>
                              <Button
                                variant="ghost"
                                onClick={() => handleUpdateStatus(application.id, 'rejected')}
                              >
                                ✗ Refuser
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Accepted Applications */}
              {acceptedApplications.length > 0 && (
                <div>
                  <h2 className="text-2xl font-bold text-neutral-900 mb-4">
                    Acceptées ({acceptedApplications.length})
                  </h2>
                  <div className="space-y-4">
                    {acceptedApplications.map((application) => (
                      <div key={application.id} className="bg-white rounded-xl shadow-sm p-6 border border-success-200">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center">
                            <span className="text-white font-bold text-lg">
                              {application.applicant.first_name[0]}{application.applicant.last_name[0]}
                            </span>
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-neutral-900">
                              {application.applicant.first_name} {application.applicant.last_name}
                            </h3>
                            <p className="text-sm text-neutral-600">
                              {application.applicant.city}
                            </p>
                          </div>
                          <Badge variant="success">Acceptée</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Rejected Applications */}
              {rejectedApplications.length > 0 && (
                <div>
                  <h2 className="text-2xl font-bold text-neutral-900 mb-4">
                    Refusées ({rejectedApplications.length})
                  </h2>
                  <div className="space-y-4">
                    {rejectedApplications.map((application) => (
                      <div key={application.id} className="bg-white rounded-xl shadow-sm p-6 border border-neutral-200 opacity-60">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-neutral-300 rounded-full flex items-center justify-center">
                            <span className="text-white font-bold text-lg">
                              {application.applicant.first_name[0]}{application.applicant.last_name[0]}
                            </span>
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-neutral-900">
                              {application.applicant.first_name} {application.applicant.last_name}
                            </h3>
                            <p className="text-sm text-neutral-600">
                              {application.applicant.city}
                            </p>
                          </div>
                          <Badge variant="secondary">Refusée</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
