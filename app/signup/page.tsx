import type { Metadata } from 'next';
import { Suspense } from 'react';
import SignupForm from './SignupForm';

export const metadata: Metadata = {
  title: 'Créer un compte',
  description: 'Rejoignez TERRII gratuitement. Porteur de projet ou talent local, trouvez vos collaborateurs sur votre territoire.',
};

export default function SignupPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-neutral-600">Chargement...</p>
        </div>
      </div>
    }>
      <SignupForm />
    </Suspense>
  );
}
