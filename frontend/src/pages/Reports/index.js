import React from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import { FiTrendingUp, FiPackage, FiDollarSign, FiPieChart, FiLock } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';

const Reports = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  
  // Sadece admin finansal verileri görebilir
  const canViewFinancials = user?.role === 'admin';

  const { data: stats } = useQuery({
    queryKey: ['reportsStats'],
    queryFn: async () => {
      const res = await api.get('/dashboard/stats');
      return res.data.data;
    },
    refetchInterval: 30000, // Her 30 saniyede bir otomatik yenile
    refetchOnWindowFocus: true, // Pencereye dönüldüğünde yenile
    staleTime: 10000, // 10 saniye boyunca cache kullan
    cacheTime: 60000 // 1 dakika cache
  });

  const ReportCard = ({ icon: Icon, title, value, color }) => (
    <div className="card p-6">
      <div className="flex items-center gap-4">
        <div className={`p-4 rounded-lg ${color}`}>
          <Icon className="text-3xl text-white" />
        </div>
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        {t('report.title')}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <ReportCard
          icon={FiPackage}
          title="Toplam Ürün"
          value={stats?.statistics.totalProducts || 0}
          color="bg-blue-600"
        />
        
        {canViewFinancials ? (
          <ReportCard
            icon={FiTrendingUp}
            title="Toplam Satış"
            value={`₺${stats?.sales.monthly?.toLocaleString() || 0}`}
            color="bg-green-600"
          />
        ) : (
          <div className="card p-6">
            <div className="flex items-center gap-4">
              <div className="p-4 rounded-lg bg-gray-400">
                <FiTrendingUp className="text-3xl text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Toplam Satış</p>
                <p className="text-2xl font-bold text-gray-400 dark:text-gray-600 mt-1 flex items-center gap-2">
                  <FiLock size={18} />
                  Gizli
                </p>
              </div>
            </div>
          </div>
        )}
        
        {canViewFinancials ? (
          <ReportCard
            icon={FiDollarSign}
            title="Stok Değeri"
            value={`₺${parseFloat(stats?.statistics.stockValue || 0).toLocaleString()}`}
            color="bg-purple-600"
          />
        ) : (
          <div className="card p-6">
            <div className="flex items-center gap-4">
              <div className="p-4 rounded-lg bg-gray-400">
                <FiDollarSign className="text-3xl text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Stok Değeri</p>
                <p className="text-2xl font-bold text-gray-400 dark:text-gray-600 mt-1 flex items-center gap-2">
                  <FiLock size={18} />
                  Gizli
                </p>
              </div>
            </div>
          </div>
        )}
        
        <ReportCard
          icon={FiPieChart}
          title="Düşük Stok"
          value={stats?.statistics.lowStockProducts || 0}
          color="bg-orange-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {canViewFinancials ? (
          <div className="card p-6">
            <h2 className="text-lg font-semibold mb-4">Stok Değer Raporu</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Toplam Stok Değeri</p>
                  <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                    ₺{(stats?.statistics?.stockValue || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
                <FiDollarSign className="text-4xl text-blue-600 dark:text-blue-400" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded">
                  <p className="text-xs text-gray-600 dark:text-gray-400">Aktif Ürün</p>
                  <p className="text-lg font-semibold">{stats?.statistics?.totalProducts || 0}</p>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded">
                  <p className="text-xs text-gray-600 dark:text-gray-400">Düşük Stok</p>
                  <p className="text-lg font-semibold text-yellow-600">{stats?.statistics?.lowStockProducts || 0}</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="card p-6 bg-gray-100 dark:bg-gray-800">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-400">
              <FiLock size={18} />
              Stok Değer Raporu
            </h2>
            <p className="text-gray-500 dark:text-gray-600">
              Bu raporu görüntüleme yetkiniz bulunmuyor.
            </p>
          </div>
        )}

        <div className="card p-6">
          <h2 className="text-lg font-semibold mb-4">Satış Analizi</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded">
              <span className="text-gray-600 dark:text-gray-400">Bugünkü Satışlar</span>
              <span className="font-semibold">{stats?.sales?.today ? `${(stats.sales.today).toFixed(0)} adet` : '0 adet'}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded">
              <span className="text-gray-600 dark:text-gray-400">Aylık Satışlar</span>
              <span className="font-semibold">{canViewFinancials ? `₺${(stats?.sales?.monthly || 0).toLocaleString()}` : '🔒 Gizli'}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded">
              <span className="text-gray-600 dark:text-gray-400">Yıllık Satışlar</span>
              <span className="font-semibold">{canViewFinancials ? `₺${(stats?.sales?.yearly || 0).toLocaleString()}` : '🔒 Gizli'}</span>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <h2 className="text-lg font-semibold mb-4">Kritik Stok Raporu</h2>
          <div className="space-y-3 max-h-60 overflow-y-auto">
            {stats?.lowStockItems && stats.lowStockItems.length > 0 ? (
              stats.lowStockItems.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-white">{item.name}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">SKU: {item.sku || 'N/A'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-red-700 dark:text-red-300">
                      {item.total_quantity || 0} / {item.min_stock_level || 0}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 dark:text-gray-400">Kritik stok yok</p>
            )}
          </div>
        </div>

        {canViewFinancials ? (
          <div className="card p-6">
            <h2 className="text-lg font-semibold mb-4">Kar-Zarar Analizi</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Toplam Satış (Bu Ay)</p>
                  <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                    ₺{(stats?.sales?.monthly || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
                <FiTrendingUp className="text-4xl text-green-600 dark:text-green-400" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded">
                  <p className="text-xs text-gray-600 dark:text-gray-400">Bugün</p>
                  <p className="text-lg font-semibold text-green-600">₺{(stats?.sales?.today || 0).toLocaleString()}</p>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded">
                  <p className="text-xs text-gray-600 dark:text-gray-400">Yıllık</p>
                  <p className="text-lg font-semibold text-blue-600">₺{(stats?.sales?.yearly || 0).toLocaleString()}</p>
                </div>
              </div>
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800">
                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Bekleyen Siparişler</p>
                  <p className="text-xl font-bold text-blue-700 dark:text-blue-300">{stats?.statistics?.pendingOrders || 0}</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="card p-6 bg-gray-100 dark:bg-gray-800">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-400">
              <FiLock size={18} />
              Kar-Zarar Analizi
            </h2>
            <p className="text-gray-500 dark:text-gray-600">
              Bu raporu görüntüleme yetkiniz bulunmuyor.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;
