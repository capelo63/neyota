'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';

type Registration = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string;
  role: string;
  city: string | null;
  postal_code: string | null;
  created_at: string;
};

const ROLE_LABELS: Record<string, string> = {
  talent: 'Talent',
  entrepreneur: "Porteur d'initiative",
  partner: 'Partenaire',
};

const ROLE_COLORS: Record<string, string> = {
  talent: 'bg-blue-100 text-blue-700',
  entrepreneur: 'bg-amber-100 text-amber-700',
  partner: 'bg-green-100 text-green-700',
};

function isProfileComplete(r: Registration): boolean {
  return (
    !!r.city &&
    r.city !== 'À définir' &&
    !!r.postal_code &&
    r.postal_code !== '00000'
  );
}

function isThisWeek(dateStr: string): boolean {
  const d = new Date(dateStr);
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  return d >= weekAgo;
}

function isThisMonth(dateStr: string): boolean {
  const d = new Date(dateStr);
  const now = new Date();
  return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
}

export default function RegistrationsList() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [periodFilter, setPeriodFilter] = useState<string>('all');

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase.rpc('get_admin_registrations');
      if (error) {
        setError(error.message);
      } else {
        setRegistrations((data as Registration[]) ?? []);
      }
      setIsLoading(false);
    };
    load();
  }, []);

  const filtered = registrations.filter((r) => {
    if (roleFilter !== 'all' && r.role !== roleFilter) return false;
    if (periodFilter === 'week' && !isThisWeek(r.created_at)) return false;
    if (periodFilter === 'month' && !isThisMonth(r.created_at)) return false;
    return true;
  });

  const thisWeekCount = registrations.filter((r) => isThisWeek(r.created_at)).length;
  const byRole = {
    talent: registrations.filter((r) => r.role === 'talent').length,
    entrepreneur: registrations.filter((r) => r.role === 'entrepreneur').length,
    partner: registrations.filter((r) => r.role === 'partner').length,
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 text-sm">
        Erreur : {error}
      </div>
    );
  }

  return (
    <div>
      {/* Indicateurs synthétiques */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <div className="col-span-2 md:col-span-1 bg-white rounded-xl border border-neutral-200 p-5">
          <div className="text-3xl font-bold text-neutral-900 mb-1">{registrations.length}</div>
          <div className="text-sm text-neutral-500">Total inscrits</div>
        </div>
        <div className="bg-white rounded-xl border border-neutral-200 p-5">
          <div className="text-3xl font-bold text-amber-600 mb-1">{thisWeekCount}</div>
          <div className="text-sm text-neutral-500">Cette semaine</div>
        </div>
        <div className="bg-white rounded-xl border border-neutral-200 p-5">
          <div className="text-3xl font-bold text-blue-600 mb-1">{byRole.talent}</div>
          <div className="text-sm text-neutral-500">Talents</div>
        </div>
        <div className="bg-white rounded-xl border border-neutral-200 p-5">
          <div className="text-3xl font-bold text-amber-600 mb-1">{byRole.entrepreneur}</div>
          <div className="text-sm text-neutral-500">Porteurs</div>
        </div>
        <div className="bg-white rounded-xl border border-neutral-200 p-5">
          <div className="text-3xl font-bold text-green-600 mb-1">{byRole.partner}</div>
          <div className="text-sm text-neutral-500">Partenaires</div>
        </div>
      </div>

      {/* Filtres */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="flex items-center gap-2">
          <span className="text-sm text-neutral-500 font-medium">Rôle :</span>
          {(['all', 'talent', 'entrepreneur', 'partner'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                roleFilter === r
                  ? 'bg-amber-500 text-white'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              {r === 'all' ? 'Tous' : ROLE_LABELS[r] ?? r}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-neutral-500 font-medium">Période :</span>
          {([
            { value: 'all', label: 'Tout' },
            { value: 'week', label: 'Cette semaine' },
            { value: 'month', label: 'Ce mois' },
          ] as const).map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setPeriodFilter(value)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                periodFilter === value
                  ? 'bg-amber-500 text-white'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Liste */}
      {filtered.length === 0 ? (
        <p className="text-neutral-500 text-sm py-8 text-center">Aucun inscrit pour ces filtres.</p>
      ) : (
        <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-neutral-50 border-b border-neutral-200">
                <th className="text-left px-4 py-3 font-medium text-neutral-600">Nom</th>
                <th className="text-left px-4 py-3 font-medium text-neutral-600">Email</th>
                <th className="text-left px-4 py-3 font-medium text-neutral-600">Rôle</th>
                <th className="text-left px-4 py-3 font-medium text-neutral-600">Inscrit le</th>
                <th className="text-left px-4 py-3 font-medium text-neutral-600">Profil</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filtered.map((r) => {
                const complete = isProfileComplete(r);
                return (
                  <tr key={r.id} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-neutral-900">
                      {r.first_name || '—'} {r.last_name || ''}
                    </td>
                    <td className="px-4 py-3 text-neutral-600">
                      <a href={`mailto:${r.email}`} className="hover:text-amber-600 transition-colors">
                        {r.email}
                      </a>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${ROLE_COLORS[r.role] ?? 'bg-neutral-100 text-neutral-600'}`}>
                        {ROLE_LABELS[r.role] ?? r.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-neutral-500">
                      {new Date(r.created_at).toLocaleDateString('fr-FR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        complete
                          ? 'bg-green-100 text-green-700'
                          : 'bg-neutral-100 text-neutral-500'
                      }`}>
                        {complete ? 'Complété' : 'Incomplet'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="px-4 py-3 bg-neutral-50 border-t border-neutral-200 text-xs text-neutral-500">
            {filtered.length} inscrit{filtered.length > 1 ? 's' : ''} affiché{filtered.length > 1 ? 's' : ''}
          </div>
        </div>
      )}
    </div>
  );
}
