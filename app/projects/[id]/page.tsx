import { Suspense } from 'react';
import ProjectDetails from './ProjectDetails';

export default async function ProjectPage({
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
            <p className="text-neutral-600">Chargement du projet...</p>
          </div>
        </div>
      }
    >
      <ProjectDetails projectId={id} />
    </Suspense>
  );
}
