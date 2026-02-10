import { Suspense } from 'react';
import ProfileEditForm from './ProfileEditForm';

export default function ProfileEditPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-gray-600">Chargement...</div>
        </div>
      }
    >
      <ProfileEditForm />
    </Suspense>
  );
}
