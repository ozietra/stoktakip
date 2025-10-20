import React from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import { FiPackage, FiAlertTriangle, FiUsers, FiTrendingUp, FiLock } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';

const Dashboard = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  
  // Sadece admin finansal verileri görebilir
  const canViewFinancials = user?.role === 'admin';

  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: async () => {
      const response = await api.get('/dashboard/stats');
      return response.data.data;
    },
    refetchInterval: 30000, // Her 30 saniyede bir otomatik yenile
    refetchOnWindowFocus: true, // Pencereye dönüldüğünde yenile
    staleTime: 10000, // 10 saniye boyunca cache kullan
    cacheTime: 60000 // 1 dakika cache
  });

  const StatCard = ({ icon: Icon, title, value, color }) => (
    <div className="card p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
            {isLoading ? '...' : (value || 0)}
          </p>
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="text-2xl text-white" />
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {t('dashboard.title')}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Hoş geldiniz! İşte işletmenizin genel durumu.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatCard
          icon={FiPackage}
          title={t('dashboard.totalProducts')}
          value={stats?.statistics?.totalProducts || 0}
          color="bg-primary-600"
        />
        <StatCard
          icon={FiAlertTriangle}
          title={t('dashboard.lowStockProducts')}
          value={stats?.statistics?.lowStockProducts || 0}
          color="bg-yellow-600"
        />
        <StatCard
          icon={FiUsers}
          title={t('dashboard.totalCustomers')}
          value={stats?.statistics?.totalCustomers || 0}
          color="bg-green-600"
        />
        {canViewFinancials ? (
          <StatCard
            icon={FiTrendingUp}
            title={t('dashboard.todaySales')}
            value={`₺${(stats?.sales?.today || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            color="bg-blue-600"
          />
        ) : (
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{t('dashboard.todaySales')}</p>
                <p className="text-2xl font-bold text-gray-400 dark:text-gray-600 mt-2 flex items-center gap-2">
                  <FiLock size={20} />
                  Gizli
                </p>
              </div>
              <div className="p-3 rounded-lg bg-gray-400">
                <FiTrendingUp className="text-2xl text-white" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {t('dashboard.recentMovements')}
          </h2>
          <div className="space-y-3">
            {stats?.recentMovements?.slice(0, 5).map((movement, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {movement.product?.name}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {movement.warehouse?.name}
                  </p>
                </div>
                <span className={`badge ${
                  movement.type === 'in' ? 'badge-success' : 'badge-danger'
                }`}>
                  {movement.type === 'in' ? '+' : '-'}{movement.quantity}
                </span>
              </div>
            )) || <p className="text-gray-500 dark:text-gray-400">Henüz hareket yok</p>}
          </div>
        </div>

        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Stok Uyarıları
          </h2>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {isLoading ? (
              <p className="text-gray-500 dark:text-gray-400">Yükleniyor...</p>
            ) : stats?.lowStockItems && stats.lowStockItems.length > 0 ? (
              stats.lowStockItems.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-white">
                      {item.name}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      SKU: {item.sku || 'N/A'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-yellow-700 dark:text-yellow-300">
                      Stok: {item.total_quantity || 0}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Min: {item.min_stock_level || 0}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 dark:text-gray-400">Stok uyarısı yok</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

