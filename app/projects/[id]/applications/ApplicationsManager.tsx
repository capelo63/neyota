'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import Link from 'next/link';
import { Button } from '@/components/ui';

interface Application {
  id: string;
  talent_id: string;
  project_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  motivation_message: string | null;
  created_at: string;
  talent: {
    id: string;
    first_name: string;
    last_name: string;
    avatar_url: string | null;
    city: string;
    postal_code: string;
  };
}

interface Project {
  id: string;
  title: string;
  owner_id: string;
}

const STATUS_LABELS = {
  pending: 'En attente',
  accepted: 'Acceptée',
  rejected: 'Refusée',
};

const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  accepted: 'bg-success-100 text-success-800 border-success-200',
  rejected: 'bg-neutral-100 text-neutral-800 border-neutral-200',
};

export default function ApplicationsManager({ projectId }: { projectId: string }) {
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<Application[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'pending' | 'accepted' | 'rejected'>('all');
  const [processingId, setProcessingId] = useState<string | null>(null);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    loadData();
  }, [projectId]);

  useEffect(() => {
    filterApplications();
  }, [selectedFilter, applications]);

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

      // Get project
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select('id, title, owner_id')
        .eq('id', projectId)
        .single();

      if (projectError || !projectData) {
        setError('Projet introuvable');
        setIsLoading(false);
        return;
      }

      // Check if user is the owner
      if (projectData.owner_id !== user.id) {
        setError('Vous n\'êtes pas autorisé à voir ces candidatures');
        setIsLoading(false);
        return;
      }

      setProject(projectData);

      // Get applications with talent info
      const { data: applicationsData, error: applicationsError } = await supabase
        .from('applications')
        .select(`
          id,
          talent_id,
          project_id,
          status,
          motivation_message,
          created_at,
          talent:profiles!applications_talent_id_fkey (
            id,
            first_name,
            last_name,
            avatar_url,
            city,
            postal_code
          )
        `)
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (applicationsError) {
        console.error('Applications error:', applicationsError);
        setError('Erreur lors du chargement des candidatures');
        setIsLoading(false);
        return;
      }

      // Transform data to handle array from select
      const transformedApplications = (applicationsData || []).map((app: any) => ({
        ...app,
        talent: Array.isArray(app.talent) ? app.talent[0] : app.talent,
      }));

      setApplications(transformedApplications);
      setIsLoading(false);
    } catch (err: any) {
      console.error('Error loading data:', err);
      setError(err.message || 'Erreur lors du chargement');
      setIsLoading(false);
    }
  };

  const filterApplications = () => {
    if (selectedFilter === 'all') {
      setFilteredApplications(applications);
    } else {
      setFilteredApplications(
        applications.filter((app) => app.status === selectedFilter)
      );
    }
  };

  const handleUpdateStatus = async (
    applicationId: string,
    newStatus: 'accepted' | 'rejected'
  ) => {
    if (processingId) return;

    setProcessingId(applicationId);

    try {
      const { error: updateError } = await supabase
        .from('applications')
        .update({ status: newStatus })
        .eq('id', applicationId);

      if (updateError) {
        console.error('Update error:', updateError);
        alert('Erreur lors de la mise à jour');
        setProcessingId(null);
        return;
      }

      // Update local state
      setApplications((prev) =>
        prev.map((app) =>
          app.id === applicationId ? { ...app, status: newStatus } : app
        )
      );

      setProcessingId(null);
    } catch (err: any) {
      console.error('Error updating application:', err);
      alert('Erreur lors de la mise à jour');
      setProcessingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-neutral-600">Chargement des candidatures...</p>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-neutral-900 mb-2">
            Erreur
          </h2>
          <p className="text-neutral-600 mb-4">{error || 'Une erreur est survenue'}</p>
          <Link href="/dashboard">
            <Button variant="secondary">Retour au dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  const pendingCount = applications.filter((app) => app.status === 'pending').length;
  const acceptedCount = applications.filter((app) => app.status === 'accepted').length;
  const rejectedCount = applications.filter((app) => app.status === 'rejected').length;

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
            <Link href={`/projects/${projectId}`}>
              <Button variant="ghost" size="sm">
                ← Retour au projet
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container-custom py-8">
        <div className="max-w-5xl mx-auto">
          {/* Page Header */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h1 className="text-3xl font-bold text-neutral-900 mb-2">
              Candidatures
            </h1>
            <p className="text-neutral-600">
              Projet : <strong>{project.title}</strong>
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <button
              onClick={() => setSelectedFilter('all')}
              className={`bg-white rounded-xl shadow-sm p-6 text-left transition-all hover:shadow-md ${
                selectedFilter === 'all' ? 'ring-2 ring-primary-500' : ''
              }`}
            >
              <div className="text-3xl font-bold text-neutral-900 mb-1">
                {applications.length}
              </div>
              <div className="text-neutral-600">Total</div>
            </button>

            <button
              onClick={() => setSelectedFilter('pending')}
              className={`bg-white rounded-xl shadow-sm p-6 text-left transition-all hover:shadow-md ${
                selectedFilter === 'pending' ? 'ring-2 ring-yellow-500' : ''
              }`}
            >
              <div className="text-3xl font-bold text-yellow-600 mb-1">
                {pendingCount}
              </div>
              <div className="text-neutral-600">En attente</div>
            </button>

            <button
              onClick={() => setSelectedFilter('accepted')}
              className={`bg-white rounded-xl shadow-sm p-6 text-left transition-all hover:shadow-md ${
                selectedFilter === 'accepted' ? 'ring-2 ring-success-500' : ''
              }`}
            >
              <div className="text-3xl font-bold text-success-600 mb-1">
                {acceptedCount}
              </div>
              <div className="text-neutral-600">Acceptées</div>
            </button>

            <button
              onClick={() => setSelectedFilter('rejected')}
              className={`bg-white rounded-xl shadow-sm p-6 text-left transition-all hover:shadow-md ${
                selectedFilter === 'rejected' ? 'ring-2 ring-neutral-500' : ''
              }`}
            >
              <div className="text-3xl font-bold text-neutral-600 mb-1">
                {rejectedCount}
              </div>
              <div className="text-neutral-600">Refusées</div>
            </button>
          </div>

          {/* Applications List */}
          <div className="space-y-4">
            {filteredApplications.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                <div className="text-6xl mb-4">📭</div>
                <h3 className="text-xl font-semibold text-neutral-900 mb-2">
                  Aucune candidature
                </h3>
                <p className="text-neutral-600">
                  {selectedFilter === 'all'
                    ? 'Aucun talent n\'a encore postulé à ce projet.'
                    : `Aucune candidature ${STATUS_LABELS[selectedFilter].toLowerCase()}.`}
                </p>
              </div>
            ) : (
              filteredApplications.map((application) => (
                <div
                  key={application.id}
                  className="bg-white rounded-xl shadow-sm p-6"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4 flex-1">
                      {/* Avatar */}
                      <Link href={`/profile/${application.talent.id}`}>
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-xl font-bold flex-shrink-0 cursor-pointer hover:scale-105 transition-transform">
                          {application.talent.first_name[0]}
                          {application.talent.last_name[0]}
                        </div>
                      </Link>

                      {/* Info */}
                      <div className="flex-1">
                        <Link href={`/profile/${application.talent.id}`}>
                          <h3 className="text-xl font-semibold text-neutral-900 hover:text-primary-600 transition-colors cursor-pointer">
                            {application.talent.first_name}{' '}
                            {application.talent.last_name}
                          </h3>
                        </Link>
                        <p className="text-neutral-600 mb-2">
                          {application.talent.city} ({application.talent.postal_code})
                        </p>
                        <p className="text-sm text-neutral-500">
                          Candidature envoyée le{' '}
                          {new Date(application.created_at).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <span
                      className={`px-4 py-2 rounded-full text-sm font-medium border ${
                        STATUS_COLORS[application.status]
                      }`}
                    >
                      {STATUS_LABELS[application.status]}
                    </span>
                  </div>

                  {/* Message */}
                  {application.motivation_message && (
                    <div className="bg-neutral-50 rounded-lg p-4 mb-4">
                      <h4 className="text-sm font-semibold text-neutral-900 mb-2">
                        Message du talent :
                      </h4>
                      <p className="text-neutral-700 whitespace-pre-wrap">
                        {application.motivation_message}
                      </p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-3 pt-4 border-t border-neutral-200">
                    <Link href={`/profile/${application.talent.id}`}>
                      <Button variant="secondary" size="sm">
                        👤 Voir le profil
                      </Button>
                    </Link>

                    {application.status === 'pending' && (
                      <>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleUpdateStatus(application.id, 'accepted')}
                          disabled={processingId === application.id}
                        >
                          ✅ Accepter
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleUpdateStatus(application.id, 'rejected')}
                          disabled={processingId === application.id}
                        >
                          ❌ Refuser
                        </Button>
                      </>
                    )}

                    {application.status === 'accepted' && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleUpdateStatus(application.id, 'rejected')}
                        disabled={processingId === application.id}
                      >
                        ❌ Annuler l'acceptation
                      </Button>
                    )}

                    {application.status === 'rejected' && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleUpdateStatus(application.id, 'accepted')}
                        disabled={processingId === application.id}
                      >
                        ✅ Reconsidérer
                      </Button>
                    )}
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
