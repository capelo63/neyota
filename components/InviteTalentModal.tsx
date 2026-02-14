'use client';

import { useState, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { Button, Select } from '@/components/ui';

interface Project {
  id: string;
  title: string;
  short_pitch: string;
  current_phase: string;
}

interface InviteTalentModalProps {
  talentId: string;
  talentName: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const PHASE_LABELS: Record<string, string> = {
  ideation: '💡 Idéation',
  mvp_development: '🛠️ Développement MVP',
  launch: '🚀 Lancement',
  growth: '📈 Croissance',
  scaling: '🌍 Structuration',
};

export default function InviteTalentModal({
  talentId,
  talentName,
  isOpen,
  onClose,
  onSuccess,
}: InviteTalentModalProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    if (isOpen) {
      loadUserProjects();
    }
  }, [isOpen]);

  const loadUserProjects = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: projectsData } = await supabase
        .from('projects')
        .select('id, title, short_pitch, current_phase')
        .eq('owner_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      setProjects(projectsData || []);
    } catch (err) {
      console.error('Error loading projects:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedProjectId) {
      setError('Veuillez sélectionner un projet');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('Vous devez être connecté');
        return;
      }

      // Check if invitation already exists
      const { data: existingInvitation } = await supabase
        .from('applications')
        .select('id')
        .eq('project_id', selectedProjectId)
        .eq('talent_id', talentId)
        .maybeSingle();

      if (existingInvitation) {
        setError('Ce talent a déjà été invité ou a déjà postulé à ce projet');
        setIsLoading(false);
        return;
      }

      // Create invitation
      const { error: inviteError } = await supabase
        .from('applications')
        .insert({
          project_id: selectedProjectId,
          talent_id: talentId,
          invited_by: user.id,
          status: 'pending',
          motivation_message: message || `Invitation à rejoindre le projet`,
        });

      if (inviteError) throw inviteError;

      // Success
      onSuccess?.();
      onClose();

      // Reset form
      setSelectedProjectId('');
      setMessage('');
    } catch (err: any) {
      console.error('Error sending invitation:', err);
      setError(err.message || 'Erreur lors de l\'envoi de l\'invitation');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-neutral-900">
              Inviter {talentName}
            </h2>
            <button
              onClick={onClose}
              className="text-neutral-400 hover:text-neutral-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Projects check */}
          {projects.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">💼</div>
              <h3 className="text-xl font-semibold text-neutral-900 mb-2">
                Aucun projet actif
              </h3>
              <p className="text-neutral-600 mb-6">
                Vous devez d'abord créer un projet pour inviter des talents.
              </p>
              <Button
                variant="primary"
                onClick={() => window.location.href = '/projects/new'}
              >
                Créer un projet
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="bg-error-50 border border-error-200 text-error-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              {/* Project selection */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Sélectionnez un projet <span className="text-error-600">*</span>
                </label>
                <select
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">-- Choisir un projet --</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {PHASE_LABELS[project.current_phase]} • {project.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Selected project preview */}
              {selectedProjectId && (
                <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4">
                  <h4 className="font-medium text-neutral-900 mb-2">
                    {projects.find(p => p.id === selectedProjectId)?.title}
                  </h4>
                  <p className="text-sm text-neutral-600">
                    {projects.find(p => p.id === selectedProjectId)?.short_pitch}
                  </p>
                </div>
              )}

              {/* Message */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Message personnalisé (optionnel)
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Pourquoi ce talent serait parfait pour votre projet..."
                  rows={4}
                  maxLength={500}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                />
                <p className="mt-1 text-xs text-neutral-500">
                  {message.length}/500 caractères
                </p>
              </div>

              <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
                <div className="flex gap-2">
                  <svg className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <div className="text-sm text-neutral-700">
                    Le talent recevra une invitation à rejoindre votre projet et pourra l'accepter ou la refuser.
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={onClose}
                  className="flex-1"
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={isLoading || !selectedProjectId}
                  className="flex-1"
                >
                  {isLoading ? 'Envoi...' : '📨 Envoyer l\'invitation'}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
