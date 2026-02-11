import { Suspense } from 'react';
import NotificationsView from './NotificationsView';

export default function NotificationsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-gray-600">Chargement...</div>
        </div>
      }
    >
      <NotificationsView />
    </Suspense>
  );
}
