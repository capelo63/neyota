'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import { Button, Input } from '@/components/ui';

export default function ResetPasswordPage() {
  const router = useRouter();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<{ password?: string; confirmPassword?: string; general?: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isValidSession, setIsValidSession] = useState(false);
  const [passwordReset, setPasswordReset] = useState(false);

  useEffect(() => {
    // Check if we have a valid recovery session
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setIsValidSession(true);
      } else {
        // No valid session - redirect to forgot-password
        router.push('/forgot-password');
      }
    };
    checkSession();
  }, [router, supabase.auth]);

  const validatePassword = (pwd: string): string | null => {
    if (pwd.length < 8) {
      return 'Le mot de passe doit contenir au moins 8 caractères';
    }
    if (!/[A-Z]/.test(pwd)) {
      return 'Le mot de passe doit contenir au moins une majuscule';
    }
    if (!/[a-z]/.test(pwd)) {
      return 'Le mot de passe doit contenir au moins une minuscule';
    }
    if (!/[0-9]/.test(pwd)) {
      return 'Le mot de passe doit contenir au moins un chiffre';
    }
    return null;
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);

    // Validation
    const newErrors: typeof errors = {};

    const passwordError = validatePassword(password);
    if (passwordError) {
      newErrors.password = passwordError;
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) {
        setErrors({ general: error.message || 'Une erreur est survenue. Veuillez réessayer.' });
        setIsLoading(false);
        return;
      }

      // Success - show confirmation and redirect
      setPasswordReset(true);
      setIsLoading(false);

      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (error) {
      console.error('Reset password error:', error);
      setErrors({ general: 'Une erreur est survenue. Veuillez réessayer.' });
      setIsLoading(false);
    }
  };

  if (!isValidSession) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-neutral-600">Vérification en cours...</p>
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
        <div className="w-full max-w-md">
          {/* Card */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            {!passwordReset ? (
              <>
                <div className="text-center mb-8">
                  <h1 className="text-3xl font-bold text-neutral-900 mb-2">
                    Nouveau mot de passe
                  </h1>
                  <p className="text-neutral-600">
                    Choisissez un mot de passe sécurisé pour votre compte
                  </p>
                </div>

                {/* Form */}
                <form onSubmit={handleResetPassword} className="space-y-5">
                  {errors.general && (
                    <div className="bg-error-50 border border-error-200 text-error-700 px-4 py-3 rounded-lg text-sm">
                      {errors.general}
                    </div>
                  )}

                  <Input
                    type="password"
                    label="Nouveau mot de passe"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    error={errors.password}
                    required
                    autoComplete="new-password"
                  />

                  <Input
                    type="password"
                    label="Confirmer le mot de passe"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    error={errors.confirmPassword}
                    required
                    autoComplete="new-password"
                  />

                  {/* Password Requirements */}
                  <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4 text-sm text-neutral-600">
                    <p className="font-medium mb-2">Le mot de passe doit contenir :</p>
                    <ul className="space-y-1">
                      <li className={password.length >= 8 ? 'text-success-600' : ''}>
                        • Au moins 8 caractères
                      </li>
                      <li className={/[A-Z]/.test(password) ? 'text-success-600' : ''}>
                        • Au moins une majuscule
                      </li>
                      <li className={/[a-z]/.test(password) ? 'text-success-600' : ''}>
                        • Au moins une minuscule
                      </li>
                      <li className={/[0-9]/.test(password) ? 'text-success-600' : ''}>
                        • Au moins un chiffre
                      </li>
                    </ul>
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    className="w-full"
                    isLoading={isLoading}
                    disabled={isLoading}
                  >
                    Réinitialiser le mot de passe
                  </Button>
                </form>
              </>
            ) : (
              <>
                {/* Success Message */}
                <div className="text-center">
                  <div className="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="w-8 h-8 text-success-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-neutral-900 mb-2">
                    Mot de passe réinitialisé ! ✓
                  </h2>
                  <p className="text-neutral-600 mb-6">
                    Votre mot de passe a été mis à jour avec succès.
                  </p>
                  <div className="bg-primary-50 border border-primary-200 text-primary-700 px-4 py-3 rounded-lg text-sm mb-6">
                    Vous allez être redirigé vers la page de connexion dans quelques secondes...
                  </div>
                  <Link href="/login">
                    <Button variant="primary" className="w-full">
                      Se connecter maintenant
                    </Button>
                  </Link>
                </div>
              </>
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
