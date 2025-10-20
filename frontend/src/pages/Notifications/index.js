import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import { FiBell, FiCheck, FiCheckCircle, FiAlertTriangle, FiInfo, FiAlertCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';

const Notifications = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState('all'); // all, unread, read

  const { data, isLoading } = useQuery({
    queryKey: ['notifications', filter],
    queryFn: async () => {
      const params = filter !== 'all' ? { is_read: filter === 'read' } : {};
      const res = await api.get('/notifications', { params });
      return res.data.data;
    }
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (id) => {
      await api.put(`/notifications/${id}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications']);
      toast.success('Bildirim okundu olarak işaretlendi');
    }
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      await api.put('/notifications/mark-all-read');
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications']);
      toast.success('Tüm bildirimler okundu olarak işaretlendi');
    }
  });

  const getNotificationIcon = (type, priority) => {
    if (priority === 'urgent') return { icon: FiAlertCircle, color: 'text-red-600' };
    if (priority === 'high') return { icon: FiAlertTriangle, color: 'text-orange-600' };
    
    switch (type) {
      case 'low_stock':
      case 'out_of_stock':
        return { icon: FiAlertTriangle, color: 'text-yellow-600' };
      case 'expiry_warning':
        return { icon: FiAlertTriangle, color: 'text-orange-600' };
      case 'order_received':
        return { icon: FiCheckCircle, color: 'text-green-600' };
      case 'system':
        return { icon: FiInfo, color: 'text-blue-600' };
      default:
        return { icon: FiBell, color: 'text-gray-600' };
    }
  };

  const getPriorityBadge = (priority) => {
    const badges = {
      urgent: 'badge-danger',
      high: 'badge-warning',
      normal: 'badge-primary',
      low: 'badge-gray'
    };
    return badges[priority] || 'badge-gray';
  };

  const formatDate = (date) => {
    const now = new Date();
    const notifDate = new Date(date);
    const diffMs = now - notifDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Az önce';
    if (diffMins < 60) return `${diffMins} dakika önce`;
    if (diffHours < 24) return `${diffHours} saat önce`;
    if (diffDays < 7) return `${diffDays} gün önce`;
    return notifDate.toLocaleDateString('tr-TR');
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Bildirimler
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Sistem bildirimleri ve uyarılarınız
          </p>
        </div>
        <button 
          onClick={() => markAllAsReadMutation.mutate()}
          className="btn btn-secondary flex items-center gap-2"
        >
          <FiCheck />
          Tümünü Okundu İşaretle
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="card p-4 mb-6">
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === 'all'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            Tümü ({data?.total || 0})
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === 'unread'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            Okunmamış
          </button>
          <button
            onClick={() => setFilter('read')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === 'read'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            Okundu
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="card p-8 text-center">
            <p className="text-gray-600 dark:text-gray-400">{t('common.loading')}</p>
          </div>
        ) : data?.items?.length > 0 ? (
          data.items.map((notification) => {
            const { icon: Icon, color } = getNotificationIcon(notification.type, notification.priority);
            return (
              <div
                key={notification.id}
                className={`card p-4 transition-all hover:shadow-md ${
                  !notification.is_read ? 'bg-blue-50 dark:bg-blue-900/10 border-l-4 border-primary-600' : ''
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-lg ${color} bg-opacity-10`}>
                    <Icon className={`text-2xl ${color}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {notification.title}
                      </h3>
                      <span className={`badge ${getPriorityBadge(notification.priority)} text-xs`}>
                        {notification.priority === 'urgent' ? 'Acil' :
                         notification.priority === 'high' ? 'Önemli' :
                         notification.priority === 'low' ? 'Düşük' : 'Normal'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {notification.message}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500 dark:text-gray-500">
                        {formatDate(notification.created_at)}
                      </span>
                      {!notification.is_read && (
                        <button
                          onClick={() => markAsReadMutation.mutate(notification.id)}
                          className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 flex items-center gap-1"
                        >
                          <FiCheck size={14} />
                          Okundu İşaretle
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="card p-8 text-center">
            <FiBell className="text-6xl text-gray-400 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Bildirim Yok
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {filter === 'unread' 
                ? 'Okunmamış bildiriminiz bulunmuyor'
                : filter === 'read'
                ? 'Okunmuş bildiriminiz bulunmuyor'
                : 'Henüz hiç bildiriminiz yok'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
