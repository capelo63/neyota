'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  related_project_id: string | null;
  related_application_id: string | null;
}

export default function NotificationsView() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [loading, setLoading] = useState(true);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    loadNotifications();

    // Subscribe to new notifications
    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
        },
        (payload) => {
          setNotifications((prev) => [payload.new as Notification, ...prev]);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notifications',
        },
        (payload) => {
          setNotifications((prev) =>
            prev.map((n) => (n.id === payload.new.id ? (payload.new as Notification) : n))
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadNotifications = async () => {
    try {
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false });

      setNotifications(data || []);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await supabase.rpc('mark_notification_as_read', {
        notification_id: notificationId,
      });

      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n))
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await supabase.rpc('mark_all_notifications_as_read');
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.is_read) {
      markAsRead(notification.id);
    }

    // Navigate based on notification type
    if (notification.related_project_id) {
      router.push(`/projects/${notification.related_project_id}`);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'application_received':
        return '📩';
      case 'application_accepted':
        return '🎉';
      case 'application_rejected':
        return '❌';
      case 'new_matching_project':
        return '🎯';
      default:
        return '🔔';
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'À l\'instant';
    if (minutes < 60) return `Il y a ${minutes}min`;
    if (hours < 24) return `Il y a ${hours}h`;
    if (days < 7) return `Il y a ${days}j`;
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'unread') return !n.is_read;
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200 py-4 px-4">
        <div className="container-custom">
          <Link href="/dashboard" className="flex items-center gap-2 hover:opacity-80 transition-opacity w-fit">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-neutral-600">Retour au dashboard</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="container-custom py-8">
        <div className="max-w-4xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-neutral-900 mb-2">
              Notifications
            </h1>
            <p className="text-neutral-600">
              Suivez toutes vos interactions et opportunités
            </p>
          </div>

          {/* Filters and Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-4 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              {/* Filter Tabs */}
              <div className="flex gap-2">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    filter === 'all'
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-neutral-600 hover:bg-neutral-100'
                  }`}
                >
                  Toutes ({notifications.length})
                </button>
                <button
                  onClick={() => setFilter('unread')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    filter === 'unread'
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-neutral-600 hover:bg-neutral-100'
                  }`}
                >
                  Non lues ({unreadCount})
                </button>
              </div>

              {/* Mark All as Read */}
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                >
                  Tout marquer comme lu
                </button>
              )}
            </div>
          </div>

          {/* Notifications List */}
          <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
            {loading ? (
              <div className="px-4 py-16 text-center">
                <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-neutral-600">Chargement des notifications...</p>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="px-4 py-16 text-center">
                <div className="text-6xl mb-4">
                  {filter === 'unread' ? '✅' : '🔕'}
                </div>
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                  {filter === 'unread'
                    ? 'Aucune notification non lue'
                    : 'Aucune notification'}
                </h3>
                <p className="text-neutral-600">
                  {filter === 'unread'
                    ? 'Vous êtes à jour ! 🎉'
                    : 'Vous recevrez des notifications pour les candidatures, projets et opportunités.'}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-neutral-100">
                {filteredNotifications.map((notification) => (
                  <button
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`w-full px-6 py-4 text-left hover:bg-neutral-50 transition-colors ${
                      !notification.is_read ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <span className="text-3xl flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.type)}
                      </span>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <h3 className="text-base font-semibold text-neutral-900">
                            {notification.title}
                          </h3>
                          <span className="text-xs text-neutral-500 whitespace-nowrap flex-shrink-0">
                            {formatTime(notification.created_at)}
                          </span>
                        </div>
                        <p className="text-sm text-neutral-700 mb-2">
                          {notification.message}
                        </p>
                        {notification.related_project_id && (
                          <span className="text-xs text-primary-600 font-medium">
                            Voir le projet →
                          </span>
                        )}
                      </div>

                      {/* Unread Indicator */}
                      {!notification.is_read && (
                        <span className="w-2.5 h-2.5 bg-blue-600 rounded-full flex-shrink-0 mt-2" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info Box */}
          {filteredNotifications.length > 0 && (
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex gap-3">
                <span className="text-xl">💡</span>
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-blue-900 mb-1">
                    À propos des notifications
                  </h4>
                  <p className="text-sm text-blue-700">
                    Vous recevez des notifications pour les candidatures, les changements de statut et les nouveaux projets qui correspondent à votre profil. Les notifications anciennes sont automatiquement supprimées après 30 jours.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
