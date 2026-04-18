'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui';
import AvatarUpload from '@/components/AvatarUpload';
import { SKILL_CATEGORIES, hasCustomField, type SkillCategoryId } from '@/lib/constants/needs-skills';

interface Profile {
  id: string;
  role: 'entrepreneur' | 'talent';
  first_name: string;
  last_name: string;
  avatar_url: string | null;
  bio: string | null;
  max_distance_km: number;
}

interface Skill {
  id: string;
  name: string;
  category: string;
}

export default function ProfileEditForm() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [maxDistance, setMaxDistance] = useState(50);

  // Skills management (talents only)
  const [skillsByCategory, setSkillsByCategory] = useState<Record<string, Skill[]>>({});
  const [selectedSkillIds, setSelectedSkillIds] = useState<Set<string>>(new Set());
  const [customDetails, setCustomDetails] = useState<Record<string, string>>({});
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  const [savingSkills, setSavingSkills] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [skillsSuccess, setSkillsSuccess] = useState(false);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;

      setProfile(profileData);
      setBio(profileData.bio || '');
      setAvatarUrl(profileData.avatar_url || '');
      setMaxDistance(profileData.max_distance_km);

      if (profileData.role === 'talent') {
        const [skillsResult, userSkillsResult] = await Promise.all([
          supabase.from('skills').select('*').order('name'),
          supabase.from('user_skills').select('skill_id, custom_detail').eq('user_id', user.id),
        ]);

        // Group all available skills by category
        const grouped = (skillsResult.data || []).reduce((acc: Record<string, Skill[]>, skill: Skill) => {
          if (!acc[skill.category]) acc[skill.category] = [];
          acc[skill.category].push(skill);
          return acc;
        }, {});
        setSkillsByCategory(grouped);

        // Build selected IDs and custom details from user's current skills
        const ids = new Set<string>();
        const details: Record<string, string> = {};
        for (const us of (userSkillsResult.data || [])) {
          ids.add(us.skill_id);
          if (us.custom_detail) details[us.skill_id] = us.custom_detail;
        }
        setSelectedSkillIds(ids);
        setCustomDetails(details);

        // Expand categories that have selected skills
        const expanded: Record<string, boolean> = {};
        for (const cat of Object.keys(grouped)) {
          expanded[cat] = grouped[cat].some((s: Skill) => ids.has(s.id));
        }
        setExpandedCategories(expanded);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!profile) return;
    try {
      setSaving(true);
      setError(null);
      setSuccess(false);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ bio, avatar_url: avatarUrl || null, max_distance_km: maxDistance })
        .eq('id', profile.id);

      if (updateError) throw updateError;
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const toggleSkill = (skillId: string) => {
    setSelectedSkillIds(prev => {
      const next = new Set(prev);
      if (next.has(skillId)) {
        next.delete(skillId);
        setCustomDetails(d => { const nd = { ...d }; delete nd[skillId]; return nd; });
      } else {
        next.add(skillId);
      }
      return next;
    });
  };

  const handleSaveSkills = async () => {
    if (!profile) return;
    try {
      setSavingSkills(true);
      setError(null);

      // Delete all existing skills then re-insert
      await supabase.from('user_skills').delete().eq('user_id', profile.id);

      if (selectedSkillIds.size > 0) {
        const toInsert = Array.from(selectedSkillIds).map(skillId => ({
          user_id: profile.id,
          skill_id: skillId,
          custom_detail: customDetails[skillId] || null,
        }));
        const { error: insertError } = await supabase.from('user_skills').insert(toInsert);
        if (insertError) throw insertError;
      }

      setSkillsSuccess(true);
      setTimeout(() => setSkillsSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSavingSkills(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Chargement...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Erreur</h2>
          <p className="text-gray-600 mb-4">Impossible de charger votre profil</p>
          <Link href="/dashboard"><Button variant="secondary">Retour au tableau de bord</Button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <div className="mb-6 flex items-center justify-between gap-3">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Modifier mon profil</h1>
          <Link href={`/profile/${profile.id}`} className="shrink-0">
            <Button variant="secondary" size="sm">Voir mon profil</Button>
          </Link>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Informations générales */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Informations générales</h2>

          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800 text-sm">Profil mis à jour avec succès !</p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">Photo de profil</label>
              <AvatarUpload
                currentAvatarUrl={avatarUrl}
                userId={profile.id}
                onUploadComplete={(url) => setAvatarUrl(url)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={4}
                placeholder="Parlez de vous, votre parcours, vos motivations..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rayon de recherche : {maxDistance} km
              </label>
              <input
                type="range" min="10" max="200" step="10"
                value={maxDistance}
                onChange={(e) => setMaxDistance(parseInt(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>10 km</span>
                <span>200 km</span>
              </div>
            </div>

            <div className="pt-4">
              <Button variant="default" onClick={handleSaveProfile} disabled={saving}>
                {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
              </Button>
            </div>
          </div>
        </div>

        {/* Compétences (talents uniquement) */}
        {profile.role === 'talent' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-bold text-gray-900">Mes compétences</h2>
              <span className="text-sm text-neutral-500">
                {selectedSkillIds.size} sélectionnée{selectedSkillIds.size > 1 ? 's' : ''}
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-6">
              Cochez les compétences que vous pouvez apporter aux projets.
            </p>

            {skillsSuccess && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-800 text-sm">Compétences mises à jour !</p>
              </div>
            )}

            <div className="space-y-3 mb-6">
              {Object.entries(skillsByCategory).map(([categoryId, categorySkills]) => {
                const categoryInfo = SKILL_CATEGORIES[categoryId as SkillCategoryId];
                const isExpanded = expandedCategories[categoryId];
                const selectedCount = categorySkills.filter(s => selectedSkillIds.has(s.id)).length;

                if (!categoryInfo) return null;

                return (
                  <div key={categoryId} className="border border-neutral-200 rounded-lg overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setExpandedCategories(prev => ({ ...prev, [categoryId]: !prev[categoryId] }))}
                      className="w-full px-4 py-3 bg-neutral-50 hover:bg-neutral-100 transition-colors flex items-center justify-between text-left"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <span className="text-xl">{categoryInfo.icon}</span>
                        <div className="flex-1">
                          <div className="font-semibold text-neutral-900 text-sm">{categoryInfo.shortLabel}</div>
                          <div className="text-xs text-neutral-500 mt-0.5">{categoryInfo.description}</div>
                        </div>
                        {selectedCount > 0 && (
                          <span className="px-2 py-0.5 bg-primary-100 text-primary-700 text-xs font-medium rounded-full">
                            {selectedCount}
                          </span>
                        )}
                      </div>
                      <svg
                        className={`w-4 h-4 text-neutral-400 transition-transform ml-2 ${isExpanded ? 'rotate-180' : ''}`}
                        fill="none" stroke="currentColor" viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {isExpanded && (
                      <div className="p-3 space-y-1 bg-white">
                        {categorySkills.map((skill) => {
                          const isSelected = selectedSkillIds.has(skill.id);
                          const needsCustom = hasCustomField(skill.category as SkillCategoryId);

                          return (
                            <div key={skill.id}>
                              <label className={`flex items-center gap-3 p-2.5 rounded-lg cursor-pointer transition-all ${
                                isSelected ? 'bg-primary-50 border border-primary-200' : 'hover:bg-neutral-50 border border-transparent'
                              }`}>
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => toggleSkill(skill.id)}
                                  className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                                />
                                <span className="text-sm text-neutral-900">{skill.name}</span>
                              </label>

                              {isSelected && needsCustom && (
                                <div className="ml-10 mt-1 mb-2">
                                  <input
                                    type="text"
                                    placeholder="Précisez votre domaine..."
                                    value={customDetails[skill.id] || ''}
                                    onChange={(e) => setCustomDetails(d => ({ ...d, [skill.id]: e.target.value }))}
                                    className="w-full px-3 py-1.5 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                                  />
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <Button variant="default" onClick={handleSaveSkills} disabled={savingSkills}>
              {savingSkills ? 'Enregistrement...' : 'Enregistrer mes compétences'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
