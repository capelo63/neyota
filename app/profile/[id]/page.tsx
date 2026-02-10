import { Suspense } from 'react';
import ProfileView from './ProfileView';

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-gray-600">Chargement du profil...</div>
        </div>
      }
    >
      <ProfileView userId={id} />
    </Suspense>
  );
}
