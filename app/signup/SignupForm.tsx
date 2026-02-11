'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import { Button, Input, Checkbox, Card, CardBody } from '@/components/ui';

type UserRole = 'entrepreneur' | 'talent';

export default function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Get role from URL query params if present
  const roleParam = searchParams.get('role') as UserRole | null;

  const [step, setStep] = useState<'role' | 'info' | 'charter' | 'email-confirmation'>(roleParam ? 'info' : 'role');
  const [role, setRole] = useState<UserRole | null>(roleParam);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
  });
  const [charterAccepted, setCharterAccepted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  // Update role when URL param changes
  useEffect(() => {
    if (roleParam && !role) {
      setRole(roleParam);
      setStep('info');
    }
  }, [roleParam, role]);

  const handleRoleSelection = (selectedRole: UserRole) => {
    setRole(selectedRole);
    setStep('info');
  };

  const validateInfoStep = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Le prénom est requis';
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Le nom est requis';
    }
    if (!formData.email) {
      newErrors.email = 'L\'email est requis';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email invalide';
    }
    if (!formData.password) {
      newErrors.password = 'Le mot de passe est requis';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Le mot de passe doit contenir au moins 8 caractères';
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateInfoStep()) {
      setStep('charter');
    }
  };

  const handleFinalSubmit = async () => {
    if (!charterAccepted) {
      setErrors({ charter: 'Vous devez accepter la charte éthique pour continuer' });
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      // 1. Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName,
            role: role,
          },
        },
      });

      if (authError) {
        if (authError.message.includes('already registered')) {
          setErrors({ general: 'Cet email est déjà utilisé' });
        } else {
          setErrors({ general: authError.message });
        }
        setIsLoading(false);
        return;
      }

      if (!authData.user) {
        setErrors({ general: 'Erreur lors de la création du compte' });
        setIsLoading(false);
        return;
      }

      // 2. Create profile with temporary location data (will be completed in onboarding)
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          first_name: formData.firstName,
          last_name: formData.lastName,
          role: role,
          postal_code: '00000', // Temporary - will be updated in onboarding
          city: 'À définir', // Temporary - will be updated in onboarding
        });

      if (profileError) {
        console.error('Profile creation error:', profileError);
        setErrors({
          general: `Erreur lors de la création du profil: ${profileError.message}. Les permissions RLS ne sont pas configurées. Contactez l'administrateur avec ce code: ${profileError.code}`
        });
        setIsLoading(false);
        return;
      }

      // 3. Record charter acceptance
      const { error: charterError } = await supabase
        .from('user_charter_acceptances')
        .insert({
          user_id: authData.user.id,
          accepted_at: new Date().toISOString(),
          charter_version: 'v1.0',
          ip_address: '0.0.0.0', // Default IP - should be captured server-side in production
        });

      if (charterError) {
        console.error('Charter acceptance error:', charterError);
      }

      // 4. Check if email confirmation is required
      if (authData.user.identities && authData.user.identities.length === 0) {
        // Email confirmation required - show confirmation step
        setUserEmail(formData.email);
        setStep('email-confirmation');
        setIsLoading(false);
      } else {
        // No email confirmation needed - redirect to onboarding
        router.push('/onboarding');
        router.refresh();
      }
    } catch (error) {
      console.error('Signup error:', error);
      setErrors({ general: 'Une erreur est survenue. Veuillez réessayer.' });
      setIsLoading(false);
    }
  };

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
          {/* Progress Indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-center gap-2">
              <div className={`flex items-center gap-2 ${step === 'role' ? 'text-primary-600' : 'text-neutral-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                  step !== 'role' ? 'bg-primary-600 text-white' : 'bg-primary-100 text-primary-600'
                }`}>
                  {step !== 'role' ? '✓' : '1'}
                </div>
                <span className="hidden sm:inline font-medium">Profil</span>
              </div>
              <div className="w-12 h-0.5 bg-neutral-300"></div>
              <div className={`flex items-center gap-2 ${step === 'info' ? 'text-primary-600' : step === 'charter' ? 'text-primary-600' : 'text-neutral-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                  step === 'charter' ? 'bg-primary-600 text-white' : step === 'info' ? 'bg-primary-100 text-primary-600' : 'bg-neutral-200 text-neutral-400'
                }`}>
                  {step === 'charter' ? '✓' : '2'}
                </div>
                <span className="hidden sm:inline font-medium">Informations</span>
              </div>
              <div className="w-12 h-0.5 bg-neutral-300"></div>
              <div className={`flex items-center gap-2 ${step === 'charter' ? 'text-primary-600' : 'text-neutral-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                  step === 'charter' ? 'bg-primary-100 text-primary-600' : 'bg-neutral-200 text-neutral-400'
                }`}>
                  3
                </div>
                <span className="hidden sm:inline font-medium">Charte</span>
              </div>
            </div>
          </div>

          {/* Step Content */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            {/* STEP 1: Role Selection */}
            {step === 'role' && (
              <div>
                <div className="text-center mb-8">
                  <h1 className="text-3xl font-bold text-neutral-900 mb-2">
                    Bienvenue sur NEYOTA !
                  </h1>
                  <p className="text-neutral-600">
                    Choisissez votre profil pour commencer
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <Card
                    className="cursor-pointer group hover:border-primary-500 hover:shadow-xl transition-all"
                    onClick={() => handleRoleSelection('entrepreneur')}
                  >
                    <CardBody className="text-center p-8">
                      <div className="text-6xl mb-4">💼</div>
                      <h3 className="text-xl font-semibold text-neutral-900 mb-2">
                        Entrepreneur
                      </h3>
                      <p className="text-neutral-600 mb-4">
                        Je porte un projet et je recherche des talents pour m'accompagner
                      </p>
                      <div className="text-primary-600 font-medium group-hover:underline">
                        Choisir ce profil →
                      </div>
                    </CardBody>
                  </Card>

                  <Card
                    className="cursor-pointer group hover:border-primary-500 hover:shadow-xl transition-all"
                    onClick={() => handleRoleSelection('talent')}
                  >
                    <CardBody className="text-center p-8">
                      <div className="text-6xl mb-4">🌟</div>
                      <h3 className="text-xl font-semibold text-neutral-900 mb-2">
                        Talent
                      </h3>
                      <p className="text-neutral-600 mb-4">
                        J'ai des compétences à mettre au service de projets locaux
                      </p>
                      <div className="text-primary-600 font-medium group-hover:underline">
                        Choisir ce profil →
                      </div>
                    </CardBody>
                  </Card>
                </div>

                <div className="mt-8 text-center text-sm text-neutral-600">
                  <p>Vous avez déjà un compte ?</p>
                  <Link href="/login" className="text-primary-600 hover:text-primary-700 font-medium">
                    Se connecter
                  </Link>
                </div>
              </div>
            )}

            {/* STEP 2: Info Form */}
            {step === 'info' && (
              <div>
                <div className="text-center mb-8">
                  <div className="inline-flex items-center gap-2 bg-primary-100 text-primary-700 px-4 py-2 rounded-full mb-4">
                    <span className="text-2xl">{role === 'entrepreneur' ? '💼' : '🌟'}</span>
                    <span className="font-medium">
                      {role === 'entrepreneur' ? 'Profil Entrepreneur' : 'Profil Talent'}
                    </span>
                  </div>
                  <h1 className="text-3xl font-bold text-neutral-900 mb-2">
                    Créez votre compte
                  </h1>
                  <p className="text-neutral-600">
                    Remplissez vos informations pour continuer
                  </p>
                </div>

                <form onSubmit={handleInfoSubmit} className="space-y-5">
                  {errors.general && (
                    <div className="bg-error-50 border border-error-200 text-error-700 px-4 py-3 rounded-lg text-sm">
                      {errors.general}
                    </div>
                  )}

                  <div className="grid md:grid-cols-2 gap-4">
                    <Input
                      type="text"
                      label="Prénom"
                      placeholder="Jean"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      error={errors.firstName}
                      required
                      autoComplete="given-name"
                    />
                    <Input
                      type="text"
                      label="Nom"
                      placeholder="Dupont"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      error={errors.lastName}
                      required
                      autoComplete="family-name"
                    />
                  </div>

                  <Input
                    type="email"
                    label="Email"
                    placeholder="votre@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    error={errors.email}
                    required
                    autoComplete="email"
                  />

                  <Input
                    type="password"
                    label="Mot de passe"
                    placeholder="••••••••"
                    helperText="Au moins 8 caractères"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    error={errors.password}
                    required
                    autoComplete="new-password"
                  />

                  <Input
                    type="password"
                    label="Confirmer le mot de passe"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    error={errors.confirmPassword}
                    required
                    autoComplete="new-password"
                  />

                  <div className="flex gap-4 pt-4">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => {
                        setStep('role');
                        setRole(null);
                      }}
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

            {/* STEP 3: Charter */}
            {step === 'charter' && (
              <div>
                <div className="text-center mb-8">
                  <h1 className="text-3xl font-bold text-neutral-900 mb-2">
                    Charte éthique NEYOTA
                  </h1>
                  <p className="text-neutral-600">
                    Dernière étape : accepter notre charte éthique
                  </p>
                </div>

                <div className="bg-neutral-50 rounded-lg p-6 mb-6 max-h-96 overflow-y-auto border border-neutral-200">
                  <h3 className="font-semibold text-lg text-neutral-900 mb-4">
                    Engagement éthique et respect mutuel
                  </h3>

                  <div className="space-y-4 text-neutral-700 text-sm">
                    <div>
                      <h4 className="font-semibold mb-2">🤝 Respect et bienveillance</h4>
                      <p>
                        Tous les membres s'engagent à échanger dans le respect mutuel, sans discrimination
                        et avec bienveillance. Toute forme de harcèlement, d'intimidation ou de comportement
                        inapproprié est strictement interdite.
                      </p>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">🔒 Protection des idées</h4>
                      <p>
                        Les porteurs de projets partagent leurs idées en toute confiance. Les talents
                        s'engagent à ne pas copier, divulguer ou exploiter les projets présentés sans
                        accord explicite de l'entrepreneur. La propriété intellectuelle doit être respectée.
                      </p>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">💚 Engagement territorial</h4>
                      <p>
                        NEYOTA valorise l'entrepreneuriat local et l'impact territorial. Les membres
                        s'engagent à privilégier les collaborations de proximité et à contribuer
                        au dynamisme économique de leur territoire.
                      </p>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">✅ Honnêteté et transparence</h4>
                      <p>
                        Les informations partagées (compétences, disponibilités, état d'avancement des projets)
                        doivent être sincères et à jour. La transparence est essentielle pour bâtir des
                        relations de confiance durables.
                      </p>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">⚠️ Signalement</h4>
                      <p>
                        En cas de comportement contraire à cette charte, les membres sont encouragés à
                        signaler la situation. NEYOTA se réserve le droit de suspendre ou bannir tout
                        compte ne respectant pas ces principes.
                      </p>
                    </div>
                  </div>
                </div>

                {errors.general && (
                  <div className="bg-error-50 border border-error-200 text-error-700 px-4 py-3 rounded-lg text-sm mb-6">
                    {errors.general}
                  </div>
                )}

                <Checkbox
                  label={
                    <span>
                      J'ai lu et j'accepte la{' '}
                      <Link href="/charter" target="_blank" className="text-primary-600 hover:underline">
                        charte éthique NEYOTA
                      </Link>
                    </span>
                  }
                  checked={charterAccepted}
                  onChange={(e) => setCharterAccepted(e.target.checked)}
                  error={errors.charter}
                  required
                />

                <div className="flex gap-4 pt-6">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setStep('info')}
                    className="flex-1"
                    disabled={isLoading}
                  >
                    ← Retour
                  </Button>
                  <Button
                    type="button"
                    variant="primary"
                    onClick={handleFinalSubmit}
                    className="flex-1"
                    isLoading={isLoading}
                    disabled={!charterAccepted || isLoading}
                  >
                    Créer mon compte
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 4: Email Confirmation */}
            {step === 'email-confirmation' && (
              <div className="text-center py-8">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>

                <h1 className="text-3xl font-bold text-neutral-900 mb-4">
                  Vérifiez votre email
                </h1>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6 text-left">
                  <p className="text-neutral-700 mb-3">
                    Nous avons envoyé un email de confirmation à :
                  </p>
                  <p className="font-semibold text-neutral-900 text-lg mb-4">
                    {userEmail}
                  </p>
                  <p className="text-neutral-700">
                    📧 <strong>Cliquez sur le lien dans l'email</strong> pour activer votre compte et accéder à NEYOTA.
                  </p>
                </div>

                <div className="bg-neutral-50 rounded-lg p-4 text-sm text-neutral-600 mb-6">
                  <p className="mb-2">
                    <strong>Vous n'avez pas reçu l'email ?</strong>
                  </p>
                  <ul className="text-left space-y-1 list-disc list-inside">
                    <li>Vérifiez votre dossier spam/courrier indésirable</li>
                    <li>Assurez-vous que l'adresse email est correcte</li>
                    <li>L'email peut prendre quelques minutes à arriver</li>
                  </ul>
                </div>

                <Link href="/login">
                  <Button variant="primary" className="w-full">
                    Aller à la page de connexion
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Footer Links */}
          <div className="mt-6 text-center text-sm text-neutral-600">
            <Link href="/charter" className="hover:text-primary-600 transition-colors">
              Charte éthique
            </Link>
            <span className="mx-2">•</span>
            <Link href="/privacy" className="hover:text-primary-600 transition-colors">
              Confidentialité
            </Link>
            <span className="mx-2">•</span>
            <Link href="/terms" className="hover:text-primary-600 transition-colors">
              CGU
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
