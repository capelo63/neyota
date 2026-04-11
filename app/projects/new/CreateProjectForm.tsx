'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import Link from 'next/link';
import { Button, Input, Textarea, Select, Checkbox } from '@/components/ui';
import CityAutocomplete from '@/components/CityAutocomplete';
import { isValidFrenchPostalCode, getPostalCodeErrorMessage } from '@/lib/constants/regions';
import { NEED_CATEGORIES, NEEDS_BY_CATEGORY, type NeedCategoryId } from '@/lib/constants/needs-skills';

interface ProjectData {
  title: string;
  shortPitch: string;
  fullDescription: string;
  currentPhase: string;
  phaseObjectives: string;
  selectedCategories: string[];
  selectedNeeds: string[]; // Changed from selectedSkills to selectedNeeds
  city: string;
  postalCode: string;
  region: string;
  isRemotePossible: boolean;
  preferredRadius: number;
  lat?: number;
  lng?: number;
}

const PROJECT_PHASES = [
  { value: 'ideation', label: '💡 Idéation - Je concrétise mon idée' },
  { value: 'mvp_development', label: '🛠️ En construction - Je construis mon prototype' },
  { value: 'launch', label: '🚀 Lancement - Je lance mon produit/service' },
  { value: 'growth', label: '📈 Croissance - Je développe mon activité' },
  { value: 'scaling', label: '🌍 Structuration - Je structure et pérennise' },
];

const PROJECT_CATEGORIES = [
  { value: 'agriculture', label: '🌾 Agriculture / Agroalimentaire' },
  { value: 'mobility', label: '🚗 Mobilité / Transport' },
  { value: 'industry', label: '🏭 Industrie / Manufacturing' },
  { value: 'tech', label: '💻 Tech / Digital' },
  { value: 'health', label: '🏥 Santé / Bien-être' },
  { value: 'education', label: '🎓 Éducation / Formation' },
  { value: 'real_estate', label: '🏠 Immobilier / Construction' },
  { value: 'environment', label: '🌍 Environnement / Écologie' },
  { value: 'culture', label: '🎨 Culture / Créatif' },
  { value: 'services', label: '💼 Services / Consulting' },
  { value: 'commerce', label: '🛒 Commerce / Retail' },
  { value: 'hospitality', label: '🍽️ Restauration / Hôtellerie' },
  { value: 'finance', label: '💰 Finance / Fintech' },
  { value: 'energy', label: '⚡ Énergie' },
  { value: 'entertainment', label: '🎮 Divertissement / Loisirs' },
  { value: 'social', label: '🤝 Social / Solidaire' },
];

// NEED_CATEGORIES is now imported from lib/constants/needs-skills.ts

export default function CreateProjectForm() {
  const router = useRouter();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [needs, setNeeds] = useState<any[]>([]); // Changed from skills to needs
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(Object.keys(NEED_CATEGORIES)) // All need categories expanded by default
  );

  const [formData, setFormData] = useState<ProjectData>({
    title: '',
    shortPitch: '',
    fullDescription: '',
    currentPhase: 'ideation',
    phaseObjectives: '',
    selectedCategories: [],
    selectedNeeds: [], // Changed from selectedSkills
    city: '',
    postalCode: '',
    region: '',
    isRemotePossible: false,
    preferredRadius: 30,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
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

      // Check if user is entrepreneur
      if (profileData.role !== 'entrepreneur') {
        router.push('/dashboard');
        return;
      }

      setProfile(profileData);

      // Pre-fill location from profile
      setFormData(prev => ({
        ...prev,
        city: profileData.city || '',
        postalCode: profileData.postal_code || '',
        region: profileData.region || '',
      }));

      // Load needs
      const { data: needsData } = await supabase
        .from('needs')
        .select('*')
        .order('category, sort_order');

      setNeeds(needsData || []);
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading data:', error);
      router.push('/login');
    }
  };

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Le titre est requis';
    } else if (formData.title.length < 10) {
      newErrors.title = 'Le titre doit contenir au moins 10 caractères';
    }

    if (!formData.shortPitch.trim()) {
      newErrors.shortPitch = 'Le pitch court est requis';
    } else if (formData.shortPitch.length < 50) {
      newErrors.shortPitch = 'Le pitch doit contenir au moins 50 caractères';
    }

    if (!formData.fullDescription.trim()) {
      newErrors.fullDescription = 'La description complète est requise';
    } else if (formData.fullDescription.length < 100) {
      newErrors.fullDescription = 'La description doit contenir au moins 100 caractères';
    }

    if (formData.selectedCategories.length === 0) {
      newErrors.categories = 'Sélectionnez au moins une catégorie pour votre projet';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {};

    if (formData.selectedNeeds.length === 0) {
      newErrors.needs = 'Sélectionnez au moins un besoin pour votre projet';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.city.trim()) {
      newErrors.city = 'La ville est requise';
    }

    if (!formData.postalCode.trim()) {
      newErrors.postalCode = 'Le code postal est requis';
    } else if (!isValidFrenchPostalCode(formData.postalCode)) {
      newErrors.postalCode = getPostalCodeErrorMessage();
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
      // Use pre-fetched coordinates from autocomplete, or fall back to API
      let coordinates: { lat: number; lng: number } | null = null;
      let geoWarning = false;

      if (formData.lat && formData.lng) {
        coordinates = { lat: formData.lat, lng: formData.lng };
        console.log('[PROJECT] Using autocomplete coordinates:', coordinates);
      } else {
        try {
          const geoResponse = await fetch(
            `https://api-adresse.data.gouv.fr/search/?q=${formData.postalCode}&type=municipality&limit=1`
          );
          const geoData = await geoResponse.json();

          if (geoData.features && geoData.features.length > 0) {
            const [lng, lat] = geoData.features[0].geometry.coordinates;
            coordinates = { lng, lat };
            console.log('[PROJECT] Coordinates fetched from API:', coordinates);
          } else {
            geoWarning = true;
          }
        } catch (geoError) {
          console.error('[PROJECT] Geocoding error:', geoError);
          geoWarning = true;
        }
      }

      // Warn user if geocoding failed (impacts territorial matching)
      if (geoWarning) {
        setErrors({
          general: '⚠️ Attention : Nous n\'avons pas pu localiser précisément votre code postal. Le matching territorial pourrait être limité. Veuillez vérifier votre code postal.'
        });
        setIsSaving(false);
        return;
      }

      // Create project with coordinates
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .insert({
          owner_id: user.id,
          title: formData.title,
          short_pitch: formData.shortPitch,
          full_description: formData.fullDescription,
          current_phase: formData.currentPhase,
          phase_objectives: formData.phaseObjectives || null,
          city: formData.city,
          postal_code: formData.postalCode,
          region: formData.region || null,
          latitude: coordinates?.lat || null,
          longitude: coordinates?.lng || null,
          is_remote_possible: formData.isRemotePossible,
          preferred_radius_km: formData.preferredRadius,
          status: 'active',
        })
        .select()
        .single();

      if (projectError) {
        console.error('Project creation error:', projectError);
        setErrors({ general: 'Erreur lors de la création du projet' });
        setIsSaving(false);
        return;
      }

      // Add categories to project
      if (formData.selectedCategories.length > 0) {
        const categoriesToInsert = formData.selectedCategories.map(category => ({
          project_id: projectData.id,
          category: category,
        }));

        const { error: categoriesError } = await supabase
          .from('project_categories')
          .insert(categoriesToInsert);

        if (categoriesError) {
          console.error('Categories insert error:', categoriesError);
        }
      }

      // Add needs to project
      if (formData.selectedNeeds.length > 0) {
        const needsToInsert = formData.selectedNeeds.map(needId => ({
          project_id: projectData.id,
          need_id: needId,
          priority: 'essential', // Default priority, could be made selectable
        }));

        const { error: needsError } = await supabase
          .from('project_needs')
          .insert(needsToInsert);

        if (needsError) {
          console.error('Needs insert error:', needsError);
        }
      }

      // Redirect to dashboard
      router.push('/dashboard');
      router.refresh();
    } catch (error) {
      console.error('Project creation error:', error);
      setErrors({ general: 'Une erreur est survenue. Veuillez réessayer.' });
      setIsSaving(false);
    }
  };

  const toggleNeed = (needId: string) => {
    setFormData(prev => ({
      ...prev,
      selectedNeeds: prev.selectedNeeds.includes(needId)
        ? prev.selectedNeeds.filter(id => id !== needId)
        : [...prev.selectedNeeds, needId],
    }));
  };

  const toggleNeedCategory = (category: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(category)) {
        newSet.delete(category);
      } else {
        newSet.add(category);
      }
      return newSet;
    });
  };

  // Group needs by category
  const needsByCategory = needs.reduce((acc, need) => {
    const category = need.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(need);
    return acc;
  }, {} as Record<string, any[]>);

  const toggleCategory = (categoryValue: string) => {
    setFormData(prev => ({
      ...prev,
      selectedCategories: prev.selectedCategories.includes(categoryValue)
        ? prev.selectedCategories.filter(cat => cat !== categoryValue)
        : [...prev.selectedCategories, categoryValue],
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
          <div className="flex items-center justify-between">
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">T</span>
              </div>
              <span className="text-2xl font-bold text-neutral-900">Teriis</span>
            </Link>
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                <span className="hidden sm:inline">← Retour au dashboard</span>
                <span className="sm:hidden">← Dashboard</span>
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-3xl">
          {/* Progress */}
          <div className="mb-8">
            {/* Progress Bar */}
            <div className="relative mb-6">
              <div className="overflow-hidden h-3 text-xs flex rounded-full bg-neutral-200">
                <div
                  style={{ width: `${(step / 3) * 100}%` }}
                  className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-primary-500 to-primary-600 transition-all duration-500"
                />
              </div>
              <div className="absolute -top-1 right-0 bg-white px-2 py-0.5 rounded-full border border-primary-200">
                <span className="text-xs font-bold text-primary-600">
                  {Math.round((step / 3) * 100)}%
                </span>
              </div>
            </div>

            {/* Step Indicators */}
            <div className="flex items-center justify-between gap-2">
              {[
                { num: 1, label: 'Présentation', icon: '💼' },
                { num: 2, label: 'Besoins', icon: '🎯' },
                { num: 3, label: 'Localisation', icon: '📍' },
              ].map((s) => (
                <div key={s.num} className="flex-1">
                  <div className="flex flex-col items-center gap-2">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                        step > s.num
                          ? 'bg-primary-600 text-white shadow-lg scale-110'
                          : step === s.num
                          ? 'bg-primary-600 text-white shadow-lg scale-110'
                          : 'bg-neutral-200 text-neutral-400'
                      }`}
                    >
                      {step > s.num ? '✓' : s.icon}
                    </div>
                    <p className={`text-xs font-medium text-center ${
                      step >= s.num ? 'text-primary-600' : 'text-neutral-500'
                    }`}>
                      {s.label}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center mt-6">
              <p className="text-sm text-neutral-600">
                Étape {step} sur 3 - Créez votre projet
              </p>
            </div>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-xl shadow-lg p-5 md:p-8">
            {/* Step 1: Project Info */}
            {step === 1 && (
              <div>
                <div className="text-center mb-8">
                  <div className="text-5xl mb-4">💼</div>
                  <h1 className="text-3xl font-bold text-neutral-900 mb-2">
                    Présentez votre projet
                  </h1>
                  <p className="text-neutral-600">
                    Partagez votre vision pour attirer les bons talents
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
                    label="Titre du projet"
                    placeholder="Ex: Plateforme de mise en relation de producteurs locaux"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    error={errors.title}
                    required
                    maxLength={100}
                    helperText={`${formData.title.length}/100 caractères (minimum 10)`}
                  />

                  <Textarea
                    label="Pitch court (visible publiquement)"
                    placeholder="Résumez votre projet en quelques phrases percutantes. Ce texte sera visible par tous les talents pour susciter leur intérêt..."
                    value={formData.shortPitch}
                    onChange={(e) => setFormData({ ...formData, shortPitch: e.target.value })}
                    error={errors.shortPitch}
                    required
                    rows={4}
                    maxLength={300}
                    helperText={`${formData.shortPitch.length}/300 caractères (minimum 50)`}
                  />

                  <Textarea
                    label="Description complète (visible après candidature)"
                    placeholder="Décrivez en détail votre projet, vos objectifs, le contexte, les enjeux, ce que vous avez déjà réalisé... Cette description complète sera visible uniquement par les talents qui candidatent."
                    value={formData.fullDescription}
                    onChange={(e) => setFormData({ ...formData, fullDescription: e.target.value })}
                    error={errors.fullDescription}
                    required
                    rows={6}
                    maxLength={2000}
                    helperText={`${formData.fullDescription.length}/2000 caractères (minimum 100)`}
                  />

                  <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
                    <div className="flex gap-2">
                      <svg className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                      <div className="text-sm text-neutral-700">
                        <strong>Protection de vos idées :</strong> Seul le pitch court est visible publiquement.
                        La description complète n'est accessible qu'aux talents qui manifestent leur intérêt.
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-3">
                      Catégories du projet <span className="text-error-600">*</span>
                    </label>
                    {errors.categories && (
                      <div className="bg-error-50 border border-error-200 text-error-700 px-4 py-3 rounded-lg text-sm mb-3">
                        {errors.categories}
                      </div>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {PROJECT_CATEGORIES.map((category) => (
                        <label
                          key={category.value}
                          className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                            formData.selectedCategories.includes(category.value)
                              ? 'border-primary-500 bg-primary-50'
                              : 'border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={formData.selectedCategories.includes(category.value)}
                            onChange={() => toggleCategory(category.value)}
                            className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                          />
                          <span className="text-sm font-medium text-neutral-900">
                            {category.label}
                          </span>
                        </label>
                      ))}
                    </div>
                    <p className="mt-2 text-sm text-neutral-600">
                      {formData.selectedCategories.length} catégorie(s) sélectionnée(s)
                    </p>
                  </div>

                  <Button type="submit" variant="primary" className="w-full mt-6">
                    Continuer
                  </Button>
                </form>
              </div>
            )}

            {/* Step 2: Phase & Needs */}
            {step === 2 && (
              <div>
                <div className="text-center mb-8">
                  <div className="text-5xl mb-4">🎯</div>
                  <h1 className="text-3xl font-bold text-neutral-900 mb-2">
                    Phase et besoins
                  </h1>
                  <p className="text-neutral-600">
                    Précisez où vous en êtes et ce dont vous avez besoin pour avancer
                  </p>
                </div>

                <form onSubmit={handleStep2Submit} className="space-y-6">
                  <Select
                    label="Phase actuelle du projet"
                    value={formData.currentPhase}
                    onChange={(e) => setFormData({ ...formData, currentPhase: e.target.value })}
                    options={PROJECT_PHASES}
                    required
                  />

                  <Textarea
                    label="Objectifs de cette phase (optionnel)"
                    placeholder="Décrivez ce que vous souhaitez accomplir dans cette phase..."
                    value={formData.phaseObjectives}
                    onChange={(e) => setFormData({ ...formData, phaseObjectives: e.target.value })}
                    rows={3}
                    maxLength={500}
                  />

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-3">
                      De quoi avez-vous besoin ? <span className="text-error-600">*</span>
                    </label>
                    {errors.needs && (
                      <div className="bg-error-50 border border-error-200 text-error-700 px-4 py-3 rounded-lg text-sm mb-4">
                        {errors.needs}
                      </div>
                    )}
                    <div className="max-h-[600px] overflow-y-auto border border-neutral-200 rounded-lg">
                      <div className="divide-y divide-neutral-200">
                        {Object.entries(NEED_CATEGORIES).map(([categoryKey, categoryInfo]) => {
                          const categoryNeeds = needsByCategory[categoryKey] || [];
                          const isExpanded = expandedCategories.has(categoryKey);
                          const selectedInCategory = categoryNeeds.filter((n: any) => formData.selectedNeeds.includes(n.id)).length;

                          return (
                            <div key={categoryKey} className="bg-white">
                              <button
                                type="button"
                                onClick={() => toggleNeedCategory(categoryKey)}
                                className="w-full flex items-center justify-between p-4 hover:bg-neutral-50 transition-colors text-left"
                              >
                                <div className="flex items-center gap-3">
                                  <span className="text-2xl">{categoryInfo.icon}</span>
                                  <div>
                                    <div className="font-semibold text-neutral-900">{categoryInfo.label}</div>
                                    <div className="text-sm text-neutral-600">
                                      {categoryNeeds.length} besoin{categoryNeeds.length > 1 ? 's' : ''}
                                      {selectedInCategory > 0 && (
                                        <span className="text-primary-600 font-medium"> · {selectedInCategory} sélectionné{selectedInCategory > 1 ? 's' : ''}</span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <svg
                                  className={`w-5 h-5 text-neutral-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                              </button>

                              {isExpanded && (
                                <div className="px-4 pb-4 space-y-2">
                                  {categoryNeeds.map((need: any) => (
                                    <label
                                      key={need.id}
                                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-neutral-50 cursor-pointer transition-colors"
                                    >
                                      <input
                                        type="checkbox"
                                        checked={formData.selectedNeeds.includes(need.id)}
                                        onChange={() => toggleNeed(need.id)}
                                        className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                                      />
                                      <div>
                                        <div className="font-medium text-neutral-900">{need.name}</div>
                                        {need.description && (
                                          <div className="text-sm text-neutral-600">{need.description}</div>
                                        )}
                                      </div>
                                    </label>
                                  ))}
                                  {categoryNeeds.length === 0 && (
                                    <p className="text-sm text-neutral-500 italic px-3 py-2">
                                      Aucun besoin dans cette catégorie
                                    </p>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    <p className="mt-2 text-sm text-neutral-600">
                      {formData.selectedNeeds.length} besoin(s) sélectionné(s) au total
                    </p>
                  </div>

                  <div className="flex gap-4 pt-4">
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
              </div>
            )}

            {/* Step 3: Location & Options */}
            {step === 3 && (
              <div>
                <div className="text-center mb-8">
                  <div className="text-5xl mb-4">📍</div>
                  <h1 className="text-3xl font-bold text-neutral-900 mb-2">
                    Localisation et options
                  </h1>
                  <p className="text-neutral-600">
                    Définissez où se déroule le projet et vos préférences
                  </p>
                </div>

                <form onSubmit={handleFinalSubmit} className="space-y-5">
                  {errors.general && (
                    <div className="bg-error-50 border border-error-200 text-error-700 px-4 py-3 rounded-lg text-sm">
                      {errors.general}
                    </div>
                  )}

                  <CityAutocomplete
                    cityValue={formData.city}
                    postalCodeValue={formData.postalCode}
                    cityLabel="Ville"
                    postalLabel="Code postal"
                    cityPlaceholder="Paris, Lyon, Marseille..."
                    cityError={errors.city}
                    postalError={errors.postalCode}
                    onSelect={(suggestion) => {
                      setFormData({
                        ...formData,
                        city: suggestion.city,
                        postalCode: suggestion.postalCode,
                        region: suggestion.region || formData.region,
                        lat: suggestion.lat,
                        lng: suggestion.lng,
                      });
                      if (errors.city || errors.postalCode) {
                        setErrors({ ...errors, city: '', postalCode: '' });
                      }
                    }}
                  />

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                      Région (optionnel)
                    </label>
                    <input
                      type="text"
                      placeholder="Île-de-France (rempli automatiquement)"
                      value={formData.region}
                      onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                      className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg text-sm bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <p className="mt-1 text-xs text-neutral-500">Remplie automatiquement lors de la sélection de votre ville</p>
                  </div>

                  <Select
                    label="Rayon de recherche de talents"
                    value={formData.preferredRadius.toString()}
                    onChange={(e) => setFormData({ ...formData, preferredRadius: parseInt(e.target.value) })}
                    options={[
                      { value: '10', label: '10 km' },
                      { value: '20', label: '20 km' },
                      { value: '30', label: '30 km (recommandé)' },
                      { value: '50', label: '50 km' },
                      { value: '100', label: '100 km' },
                      { value: '200', label: '200 km' },
                    ]}
                  />

                  <div className="pt-2">
                    <Checkbox
                      label="Le projet peut se faire en distanciel"
                      checked={formData.isRemotePossible}
                      onChange={(e) => setFormData({ ...formData, isRemotePossible: e.target.checked })}
                    />
                  </div>

                  <div className="flex gap-4 pt-6">
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
                      Créer le projet
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
