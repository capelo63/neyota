'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import Link from 'next/link';
import { Button, Input, Textarea, Select, Checkbox } from '@/components/ui';

type UserRole = 'entrepreneur' | 'talent';

interface OnboardingData {
  city: string;
  postalCode: string;
  region: string;
  bio: string;
  maxDistance: number;
  selectedSkills: number[];
  availability: string;
}

export default function OnboardingForm() {
  const router = useRouter();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [skills, setSkills] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<OnboardingData>({
    city: '',
    postalCode: '',
    region: '',
    bio: '',
    maxDistance: 50,
    selectedSkills: [],
    availability: 'part_time',
  });

  useEffect(() => {
    loadUserAndSkills();
  }, []);

  const loadUserAndSkills = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
        return;
      }

      setUser(user);

      // Load profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (!profileData) {
        router.push('/login');
        return;
      }

      setProfile(profileData);

      // Load skills if user is a talent
      if (profileData.role === 'talent') {
        const { data: skillsData } = await supabase
          .from('skills')
          .select('*')
          .order('name');

        setSkills(skillsData || []);
      }

      setIsLoading(false);
    } catch (error) {
      console.error('Error loading data:', error);
      router.push('/login');
    }
  };

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.city.trim()) {
      newErrors.city = 'La ville est requise';
    }
    if (!formData.postalCode.trim()) {
      newErrors.postalCode = 'Le code postal est requis';
    } else if (!/^\d{5}$/.test(formData.postalCode)) {
      newErrors.postalCode = 'Code postal invalide (5 chiffres)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {};

    if (profile?.role === 'talent' && formData.selectedSkills.length === 0) {
      newErrors.skills = 'Sélectionnez au moins une compétence';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.bio.trim()) {
      newErrors.bio = 'La présentation est requise';
    } else if (formData.bio.trim().length < 50) {
      newErrors.bio = 'Votre présentation doit contenir au moins 50 caractères';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateStep1()) {
      setStep(2);
    }
  };

  const handleStep2Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateStep2()) {
      setStep(3);
    }
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateStep3()) {
      return;
    }

    setIsSaving(true);
    setErrors({});

    try {
      // Update profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          city: formData.city,
          postal_code: formData.postalCode,
          region: formData.region || null,
          bio: formData.bio,
          max_distance_km: formData.maxDistance,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (profileError) {
        console.error('Profile update error:', profileError);
        setErrors({ general: 'Erreur lors de la mise à jour du profil' });
        setIsSaving(false);
        return;
      }

      // If talent, save skills
      if (profile.role === 'talent' && formData.selectedSkills.length > 0) {
        const skillsToInsert = formData.selectedSkills.map(skillId => ({
          user_id: user.id,
          skill_id: skillId,
          proficiency_level: 'intermediate', // Default proficiency, can be updated later in profile
        }));

        const { error: skillsError } = await supabase
          .from('user_skills')
          .insert(skillsToInsert);

        if (skillsError) {
          console.error('Skills insert error:', skillsError);
        }
      }

      // Wait and verify the profile update is visible in the database
      let retries = 0;
      let profileUpdated = false;

      while (retries < 5 && !profileUpdated) {
        await new Promise(resolve => setTimeout(resolve, 300));

        const { data: checkProfile } = await supabase
          .from('profiles')
          .select('postal_code, city')
          .eq('id', user.id)
          .single();

        if (checkProfile && checkProfile.postal_code !== '00000' && checkProfile.city !== 'À définir') {
          profileUpdated = true;
        } else {
          retries++;
        }
      }

      // Redirect to dashboard
      router.push('/dashboard');
      router.refresh();
    } catch (error) {
      console.error('Onboarding error:', error);
      setErrors({ general: 'Une erreur est survenue. Veuillez réessayer.' });
      setIsSaving(false);
    }
  };

  const toggleSkill = (skillId: number) => {
    setFormData(prev => ({
      ...prev,
      selectedSkills: prev.selectedSkills.includes(skillId)
        ? prev.selectedSkills.filter(id => id !== skillId)
        : [...prev.selectedSkills, skillId],
    }));
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

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200 py-4 px-4">
        <div className="container-custom">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">N</span>
            </div>
            <span className="text-2xl font-bold text-neutral-900">NEYOTA</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-2xl">
          {/* Progress */}
          <div className="mb-8">
            <div className="flex items-center justify-center gap-2">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex items-center gap-2">
                  {s > 1 && <div className="w-12 h-0.5 bg-neutral-300"></div>}
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                      step >= s
                        ? 'bg-primary-600 text-white'
                        : 'bg-neutral-200 text-neutral-400'
                    }`}
                  >
                    {s}
                  </div>
                </div>
              ))}
            </div>
            <div className="text-center mt-4">
              <p className="text-sm text-neutral-600">
                Étape {step} sur 3 - Complétons votre profil
              </p>
            </div>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            {/* Step 1: Location */}
            {step === 1 && (
              <div>
                <div className="text-center mb-8">
                  <div className="text-5xl mb-4">📍</div>
                  <h1 className="text-3xl font-bold text-neutral-900 mb-2">
                    Votre localisation
                  </h1>
                  <p className="text-neutral-600">
                    NEYOTA privilégie les collaborations de proximité pour dynamiser votre territoire
                  </p>
                </div>

                <form onSubmit={handleStep1Submit} className="space-y-5">
                  {errors.general && (
                    <div className="bg-error-50 border border-error-200 text-error-700 px-4 py-3 rounded-lg text-sm">
                      {errors.general}
                    </div>
                  )}

                  <Input
                    type="text"
                    label="Ville"
                    placeholder="Paris"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    error={errors.city}
                    required
                  />

                  <Input
                    type="text"
                    label="Code postal"
                    placeholder="75001"
                    value={formData.postalCode}
                    onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                    error={errors.postalCode}
                    required
                    maxLength={5}
                  />

                  <Input
                    type="text"
                    label="Région (optionnel)"
                    placeholder="Île-de-France"
                    value={formData.region}
                    onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                  />

                  <Select
                    label="Rayon de recherche préféré"
                    value={formData.maxDistance.toString()}
                    onChange={(e) => setFormData({ ...formData, maxDistance: parseInt(e.target.value) })}
                    options={[
                      { value: '10', label: '10 km' },
                      { value: '25', label: '25 km' },
                      { value: '50', label: '50 km (recommandé)' },
                      { value: '100', label: '100 km' },
                      { value: '200', label: '200 km' },
                    ]}
                  />

                  <Button type="submit" variant="primary" className="w-full mt-6">
                    Continuer
                  </Button>
                </form>
              </div>
            )}

            {/* Step 2: Skills (for talents) or Skip (for entrepreneurs) */}
            {step === 2 && (
              <div>
                {profile?.role === 'talent' ? (
                  <>
                    <div className="text-center mb-8">
                      <div className="text-5xl mb-4">🌟</div>
                      <h1 className="text-3xl font-bold text-neutral-900 mb-2">
                        Vos compétences
                      </h1>
                      <p className="text-neutral-600">
                        Sélectionnez les compétences que vous pouvez apporter aux projets
                      </p>
                    </div>

                    <form onSubmit={handleStep2Submit} className="space-y-5">
                      {errors.skills && (
                        <div className="bg-error-50 border border-error-200 text-error-700 px-4 py-3 rounded-lg text-sm">
                          {errors.skills}
                        </div>
                      )}

                      <div className="max-h-96 overflow-y-auto border border-neutral-200 rounded-lg p-4">
                        <div className="space-y-2">
                          {skills.map((skill) => (
                            <label
                              key={skill.id}
                              className="flex items-center gap-3 p-3 rounded-lg hover:bg-neutral-50 cursor-pointer transition-colors"
                            >
                              <input
                                type="checkbox"
                                checked={formData.selectedSkills.includes(skill.id)}
                                onChange={() => toggleSkill(skill.id)}
                                className="checkbox"
                              />
                              <div>
                                <div className="font-medium text-neutral-900">{skill.name}</div>
                                {skill.description && (
                                  <div className="text-sm text-neutral-600">{skill.description}</div>
                                )}
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>

                      <div className="flex gap-4">
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => setStep(1)}
                          className="flex-1"
                        >
                          ← Retour
                        </Button>
                        <Button type="submit" variant="primary" className="flex-1">
                          Continuer
                        </Button>
                      </div>
                    </form>
                  </>
                ) : (
                  <>
                    <div className="text-center mb-8">
                      <div className="text-5xl mb-4">💼</div>
                      <h1 className="text-3xl font-bold text-neutral-900 mb-2">
                        Compétences recherchées
                      </h1>
                      <p className="text-neutral-600">
                        Vous pourrez définir les compétences nécessaires lors de la création de vos projets
                      </p>
                    </div>

                    <div className="bg-primary-50 border border-primary-200 rounded-lg p-6 mb-6">
                      <p className="text-neutral-700">
                        En tant qu'entrepreneur, vous pourrez spécifier les compétences recherchées
                        pour chaque projet que vous créerez. Passons à la suite !
                      </p>
                    </div>

                    <div className="flex gap-4">
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => setStep(1)}
                        className="flex-1"
                      >
                        ← Retour
                      </Button>
                      <Button
                        type="button"
                        variant="primary"
                        onClick={() => setStep(3)}
                        className="flex-1"
                      >
                        Continuer
                      </Button>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Step 3: Bio */}
            {step === 3 && (
              <div>
                <div className="text-center mb-8">
                  <div className="text-5xl mb-4">✨</div>
                  <h1 className="text-3xl font-bold text-neutral-900 mb-2">
                    Présentez-vous
                  </h1>
                  <p className="text-neutral-600">
                    Partagez votre parcours, vos motivations et ce qui vous anime
                  </p>
                </div>

                <form onSubmit={handleFinalSubmit} className="space-y-5">
                  {errors.general && (
                    <div className="bg-error-50 border border-error-200 text-error-700 px-4 py-3 rounded-lg text-sm">
                      {errors.general}
                    </div>
                  )}

                  <Textarea
                    label={profile?.role === 'entrepreneur' ? 'Votre présentation' : 'Votre parcours et motivations'}
                    placeholder={
                      profile?.role === 'entrepreneur'
                        ? "Parlez de votre parcours, de votre vision entrepreneuriale et de ce qui vous motive à entreprendre localement..."
                        : "Décrivez votre expérience, vos réalisations et pourquoi vous souhaitez contribuer à des projets locaux..."
                    }
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    error={errors.bio}
                    required
                    rows={6}
                    helperText={`${formData.bio.length}/500 caractères (minimum 50)`}
                    maxLength={500}
                  />

                  <div className="flex gap-4 pt-4">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setStep(2)}
                      className="flex-1"
                      disabled={isSaving}
                    >
                      ← Retour
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      className="flex-1"
                      isLoading={isSaving}
                      disabled={isSaving}
                    >
                      Terminer
                    </Button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
