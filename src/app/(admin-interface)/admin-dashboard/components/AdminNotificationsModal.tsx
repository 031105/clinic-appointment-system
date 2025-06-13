import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { useAdminDashboard } from '@/hooks/admin/useAdminDashboard';

interface AdminNotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AdminNotificationsModal({ isOpen, onClose }: AdminNotificationsModalProps) {
  const {
    notifications,
    loadingNotifications,
    notificationsPagination,
    fetchNotifications,
    markNotificationRead
  } = useAdminDashboard();

  const [page, setPage] = useState(1);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications({ page, limit: 10 });
    }
  }, [isOpen, page, fetchNotifications]);

  // 标记为已读后刷新主面板
  const handleMarkRead = async (notificationId: number) => {
    await markNotificationRead(notificationId);
    fetchNotifications({ page, limit: 10 });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <X className="h-6 w-6" />
        </button>
        <h2 className="text-xl font-semibold mb-4">All Notifications</h2>
        <div className="space-y-3">
          {loadingNotifications ? (
            <div className="text-center text-gray-500 py-8">Loading...</div>
          ) : notifications.length === 0 ? (
            <div className="text-center text-gray-500 py-8">No notifications found.</div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.notification_id}
                className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                  notification.is_read 
                    ? 'bg-gray-50 border-gray-200' 
                    : 'bg-blue-50 border-blue-200'
                }`}
                onClick={() => handleMarkRead(notification.notification_id)}
              >
                <div className="flex items-start gap-2">
                  <span className="text-lg">{notification.type === 'system' ? '⚙️' : notification.type === 'appointment' ? '📅' : '⏰'}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {notification.title}
                    </p>
                    <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(notification.created_at).toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      <span className="font-semibold">Receiver:</span> {notification.email} ({notification.first_name} {notification.last_name}, ID: {notification.user_id})
                    </p>
                  </div>
                  {!notification.is_read && (
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
        {/* Pagination */}
        {notificationsPagination.pages > 1 && (
          <div className="flex justify-center items-center gap-4 mt-6">
            <button
              onClick={() => setPage(page - 1)}
              disabled={page <= 1}
              className="px-3 py-1 text-sm border rounded disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="px-3 py-1 text-sm">
              Page {page} of {notificationsPagination.pages}
            </span>
            <button
              onClick={() => setPage(page + 1)}
              disabled={page >= notificationsPagination.pages}
              className="px-3 py-1 text-sm border rounded disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 