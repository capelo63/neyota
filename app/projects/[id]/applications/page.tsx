import { Suspense } from 'react';
import ApplicationsListForm from './ApplicationsListForm';

export default async function ApplicationsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <Suspense fallback={
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-neutral-600">Chargement...</p>
        </div>
      </div>
    }>
      <ApplicationsListForm projectId={id} />
    </Suspense>
  );
}
