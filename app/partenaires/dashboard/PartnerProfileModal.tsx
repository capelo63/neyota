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
  onClose,
}: {
  profile: VisibleProfile;
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
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
