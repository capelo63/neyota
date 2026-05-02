'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { createBrowserClient } from '@supabase/ssr';
import type { VisibleProfile } from './page';

function initials(p: VisibleProfile) {
  return `${p.first_name[0] ?? ''}${p.last_name[0] ?? ''}`.toUpperCase();
}

export default function PartnerProfileModal({
  profile,
  isFavorite,
  onToggleFavorite,
  onClose,
}: {
  profile: VisibleProfile;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  onClose: () => void;
}) {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Register the view when the modal opens
  useEffect(() => {
    supabase.rpc('register_partner_view', {
      p_viewed_profile_id: profile.id,
      p_viewed_project_id: null,
    }).then(({ error }) => {
      if (error) console.error('register_partner_view:', error.message);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile.id]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const roleLabel = profile.role === 'entrepreneur' ? 'Porteur d\'initiative' : 'Talent';
  const roleColor = profile.role === 'entrepreneur' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700';

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-neutral-100">
          <div className="flex items-center gap-4">
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt=""
                className="w-14 h-14 rounded-full object-cover shrink-0"
              />
            ) : (
              <div className="w-14 h-14 rounded-full bg-primary-100 flex items-center justify-center shrink-0">
                <span className="text-primary-700 font-bold text-lg">{initials(profile)}</span>
              </div>
            )}
            <div>
              <h2 className="text-lg font-semibold text-neutral-900">
                {profile.first_name} {profile.last_name}
              </h2>
              <p className="text-sm text-neutral-500">{profile.city}</p>
              <span className={`inline-block mt-1 text-xs font-medium px-2.5 py-0.5 rounded-full ${roleColor}`}>
                {roleLabel}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => onToggleFavorite(profile.id)}
              title={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
              className={`p-1.5 rounded-full hover:bg-neutral-100 transition-colors ${
                isFavorite ? 'text-yellow-400' : 'text-neutral-300 hover:text-neutral-500'
              }`}
            >
              <svg className="w-5 h-5" fill={isFavorite ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </button>
            <button
              onClick={onClose}
              className="text-neutral-400 hover:text-neutral-700 transition-colors p-1"
              aria-label="Fermer"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Bio */}
        <div className="p-6">
          {profile.bio ? (
            <p className="text-sm text-neutral-700 leading-relaxed">{profile.bio}</p>
          ) : (
            <p className="text-sm text-neutral-400 italic">Aucune biographie renseignée.</p>
          )}

          <div className="mt-6 pt-4 border-t border-neutral-100 flex gap-3">
            <Link
              href={`/profile/${profile.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 text-center bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors"
            >
              Voir le profil complet
              <svg className="inline ml-1.5 w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </Link>
            <button
              onClick={onClose}
              className="px-4 py-2.5 border border-neutral-200 text-neutral-600 text-sm font-medium rounded-lg hover:bg-neutral-50 transition-colors"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
