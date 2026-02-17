'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import AvatarUpload from '@/components/AvatarUpload';

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

interface UserSkill {
  id: string;
  skill_id: string;
  proficiency_level: 'beginner' | 'intermediate' | 'expert';
  skill: Skill;
}

const PROFICIENCY_OPTIONS = [
  { value: 'beginner', label: 'Débutant' },
  { value: 'intermediate', label: 'Intermédiaire' },
  { value: 'expert', label: 'Expert' },
];

export default function ProfileEditForm() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [maxDistance, setMaxDistance] = useState(50);

  // Skills management (for talents only)
  const [allSkills, setAllSkills] = useState<Skill[]>([]);
  const [userSkills, setUserSkills] = useState<UserSkill[]>([]);
  const [selectedSkillId, setSelectedSkillId] = useState('');
  const [selectedProficiency, setSelectedProficiency] = useState<'beginner' | 'intermediate' | 'expert'>('intermediate');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

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

      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
        return;
      }

      // Get profile
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

      // If talent, load skills data
      if (profileData.role === 'talent') {
        // Load all available skills
        const { data: skillsData } = await supabase
          .from('skills')
          .select('*')
          .order('name');

        setAllSkills(skillsData || []);

        // Load user's skills
        const { data: userSkillsData } = await supabase
          .from('user_skills')
          .select(`
            id,
            skill_id,
            proficiency_level,
            skill:skills (
              id,
              name,
              category
            )
          `)
          .eq('user_id', user.id);

        // Transform data to match expected format (skill is an array in response)
        const transformedSkills = (userSkillsData || []).map((item: any) => ({
          id: item.id,
          skill_id: item.skill_id,
          proficiency_level: item.proficiency_level,
          skill: Array.isArray(item.skill) ? item.skill[0] : item.skill,
        }));

        setUserSkills(transformedSkills);
      }
    } catch (err: any) {
      console.error('Error loading data:', err);
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
        .update({
          bio,
          avatar_url: avatarUrl || null,
          max_distance_km: maxDistance,
        })
        .eq('id', profile.id);

      if (updateError) throw updateError;

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      console.error('Error saving profile:', err);
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleAddSkill = async () => {
    if (!profile || !selectedSkillId) return;

    try {
      setError(null);

      const { error: insertError } = await supabase
        .from('user_skills')
        .insert({
          user_id: profile.id,
          skill_id: selectedSkillId,
          proficiency_level: selectedProficiency,
        });

      if (insertError) throw insertError;

      // Reload user skills
      await loadData();
      setSelectedSkillId('');
      setSelectedProficiency('intermediate');
    } catch (err: any) {
      console.error('Error adding skill:', err);
      setError(err.message);
    }
  };

  const handleRemoveSkill = async (userSkillId: string) => {
    try {
      setError(null);

      const { error: deleteError } = await supabase
        .from('user_skills')
        .delete()
        .eq('id', userSkillId);

      if (deleteError) throw deleteError;

      // Reload user skills
      await loadData();
    } catch (err: any) {
      console.error('Error removing skill:', err);
      setError(err.message);
    }
  };

  const handleUpdateSkillProficiency = async (
    userSkillId: string,
    newProficiency: 'beginner' | 'intermediate' | 'expert'
  ) => {
    try {
      setError(null);

      const { error: updateError } = await supabase
        .from('user_skills')
        .update({ proficiency_level: newProficiency })
        .eq('id', userSkillId);

      if (updateError) throw updateError;

      // Update local state
      setUserSkills(
        userSkills.map((us) =>
          us.id === userSkillId
            ? { ...us, proficiency_level: newProficiency }
            : us
        )
      );
    } catch (err: any) {
      console.error('Error updating skill proficiency:', err);
      setError(err.message);
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
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Erreur
          </h2>
          <p className="text-gray-600 mb-4">Impossible de charger votre profil</p>
          <Link href="/dashboard">
            <Button variant="secondary">Retour au tableau de bord</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Available skills to add (not already in user's skills)
  const availableSkills = allSkills.filter(
    (skill) => !userSkills.some((us) => us.skill_id === skill.id)
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <div className="mb-6 flex items-center justify-between gap-3">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Modifier mon profil
          </h1>
          <Link href={`/profile/${profile.id}`} className="shrink-0">
            <Button variant="secondary" size="sm">Voir mon profil</Button>
          </Link>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800">Profil mis à jour avec succès !</p>
          </div>
        )}

        {/* Basic profile info */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Informations générales
          </h2>

          <div className="space-y-4">
            {/* Avatar Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Photo de profil
              </label>
              <AvatarUpload
                currentAvatarUrl={avatarUrl}
                userId={profile.id}
                onUploadComplete={(url) => setAvatarUrl(url)}
              />
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bio
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={4}
                placeholder="Parlez de vous, votre parcours, vos motivations..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            {/* Max distance */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rayon de recherche : {maxDistance} km
              </label>
              <input
                type="range"
                min="10"
                max="200"
                step="10"
                value={maxDistance}
                onChange={(e) => setMaxDistance(parseInt(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>10 km</span>
                <span>200 km</span>
              </div>
            </div>

            {/* Save button */}
            <div className="pt-4">
              <Button
                variant="primary"
                onClick={handleSaveProfile}
                disabled={saving}
              >
                {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
              </Button>
            </div>
          </div>
        </div>

        {/* Skills management (talents only) */}
        {profile.role === 'talent' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Mes compétences
            </h2>

            {/* Add skill */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-3">
                Ajouter une compétence
              </h3>
              <div className="flex gap-3">
                <select
                  value={selectedSkillId}
                  onChange={(e) => setSelectedSkillId(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="">Sélectionnez une compétence</option>
                  {availableSkills.map((skill) => (
                    <option key={skill.id} value={skill.id}>
                      {skill.name} ({skill.category})
                    </option>
                  ))}
                </select>

                <select
                  value={selectedProficiency}
                  onChange={(e) =>
                    setSelectedProficiency(
                      e.target.value as 'beginner' | 'intermediate' | 'expert'
                    )
                  }
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  {PROFICIENCY_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>

                <Button
                  variant="primary"
                  onClick={handleAddSkill}
                  disabled={!selectedSkillId}
                >
                  Ajouter
                </Button>
              </div>
            </div>

            {/* User skills list */}
            {userSkills.length === 0 ? (
              <p className="text-gray-600">
                Vous n'avez pas encore ajouté de compétences.
              </p>
            ) : (
              <div className="space-y-3">
                {userSkills.map((userSkill) => (
                  <div
                    key={userSkill.id}
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

                    <div className="flex items-center gap-2">
                      <select
                        value={userSkill.proficiency_level}
                        onChange={(e) =>
                          handleUpdateSkillProficiency(
                            userSkill.id,
                            e.target.value as 'beginner' | 'intermediate' | 'expert'
                          )
                        }
                        className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      >
                        {PROFICIENCY_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>

                      <button
                        onClick={() => handleRemoveSkill(userSkill.id)}
                        className="text-red-600 hover:text-red-800 p-2"
                        title="Retirer cette compétence"
                      >
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
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
