import Link from 'next/link';
import { Button } from '@/components/ui';

interface LoginRequiredProps {
  title: string;
  description?: string;
  redirectPath: string;
}

/** Bloc affiché aux visiteurs non connectés à la place d'un contenu réservé aux membres. */
export default function LoginRequired({ title, description, redirectPath }: LoginRequiredProps) {
  const redirect = encodeURIComponent(redirectPath);
  return (
    <div className="max-w-xl mx-auto bg-white rounded-xl shadow-sm p-10 text-center">
      <div className="text-5xl mb-4" aria-hidden="true">🔒</div>
      <h2 className="text-2xl font-bold text-neutral-900 mb-3">{title}</h2>
      {description && <p className="text-neutral-600 mb-6">{description}</p>}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link href={`/login?redirect=${redirect}`}>
          <Button variant="default" size="lg">Se connecter</Button>
        </Link>
        <Link href={`/signup?redirect=${redirect}`}>
          <Button variant="secondary" size="lg">Créer un compte</Button>
        </Link>
      </div>
    </div>
  );
}
