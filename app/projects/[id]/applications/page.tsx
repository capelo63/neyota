import { Suspense } from 'react';
import ApplicationsManager from './ApplicationsManager';

export default async function ApplicationsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-neutral-50">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-neutral-600">Chargement des candidatures...</p>
          </div>
        </div>
      }
    >
      <ApplicationsManager projectId={id} />
    </Suspense>
  );
}
