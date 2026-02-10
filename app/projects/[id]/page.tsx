import { Suspense } from 'react';
import ProjectDetailForm from './ProjectDetailForm';

export default function ProjectDetailPage({ params }: { params: { id: string } }) {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-neutral-600">Chargement...</p>
        </div>
      </div>
    }>
      <ProjectDetailForm projectId={params.id} />
    </Suspense>
  );
}
