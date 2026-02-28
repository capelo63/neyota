'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createBrowserClient } from '@supabase/ssr';
import { Button, Input } from '@/components/ui';

export default function ForgotPasswordPage() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<{ email?: string; general?: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);

    // Basic validation
    const newErrors: typeof errors = {};
    if (!email) {
      newErrors.email = 'L\'email est requis';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Email invalide';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        setErrors({ general: error.message || 'Une erreur est survenue. Veuillez réessayer.' });
        setIsLoading(false);
        return;
      }

      // Success - show confirmation message
      setEmailSent(true);
      setIsLoading(false);
    } catch (error) {
      console.error('Reset password error:', error);
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
              <span className="text-white font-bold text-xl">T</span>
            </div>
            <span className="text-2xl font-bold text-neutral-900">Teriis</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Card */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            {!emailSent ? (
              <>
                <div className="text-center mb-8">
                  <h1 className="text-3xl font-bold text-neutral-900 mb-2">
                    Mot de passe oublié ?
                  </h1>
                  <p className="text-neutral-600">
                    Entrez votre email et nous vous enverrons un lien pour réinitialiser votre mot de passe
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
                    type="email"
                    label="Email"
                    placeholder="votre@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    error={errors.email}
                    required
                    autoComplete="email"
                  />

                  <Button
                    type="submit"
                    variant="primary"
                    className="w-full"
                    isLoading={isLoading}
                    disabled={isLoading}
                  >
                    Envoyer le lien de réinitialisation
                  </Button>
                </form>

                {/* Back to login */}
                <div className="mt-6 text-center">
                  <Link
                    href="/login"
                    className="text-sm text-neutral-600 hover:text-primary-600 transition-colors"
                  >
                    ← Retour à la connexion
                  </Link>
                </div>
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
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-neutral-900 mb-2">
                    Email envoyé ! 📧
                  </h2>
                  <p className="text-neutral-600 mb-6">
                    Nous avons envoyé un lien de réinitialisation à <strong>{email}</strong>
                  </p>
                  <div className="bg-primary-50 border border-primary-200 text-primary-700 px-4 py-3 rounded-lg text-sm mb-6">
                    Vérifiez votre boîte mail et cliquez sur le lien pour créer un nouveau mot de passe.
                    Le lien expire dans 1 heure.
                  </div>
                  <div className="space-y-3">
                    <Link href="/login">
                      <Button variant="primary" className="w-full">
                        Retour à la connexion
                      </Button>
                    </Link>
                    <button
                      onClick={() => {
                        setEmailSent(false);
                        setEmail('');
                      }}
                      className="text-sm text-neutral-600 hover:text-primary-600 transition-colors"
                    >
                      Vous n'avez pas reçu l'email ? Réessayer
                    </button>
                  </div>
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
