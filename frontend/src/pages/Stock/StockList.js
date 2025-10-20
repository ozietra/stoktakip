import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import { FiPackage, FiDollarSign, FiLayers } from 'react-icons/fi';

const StockList = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['stockList'],
    queryFn: async () => {
      const response = await api.get('/stock-movements/current');
      return response.data.data;
    },
    refetchInterval: 10000
  });

  const stocks = data || [];

  // Calculate totals
  const totalQuantity = stocks.reduce((sum, stock) => sum + parseFloat(stock.quantity || 0), 0);
  const totalValue = stocks.reduce((sum, stock) => {
    const qty = parseFloat(stock.quantity || 0);
    const price = parseFloat(stock.product?.cost_price || 0);
    return sum + (qty * price);
  }, 0);

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">Yükleniyor...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Stok Listesi</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Tüm ürünlerin güncel stok durumu</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Toplam Ürün</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {stocks.length}
              </p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <FiPackage className="text-2xl text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Toplam Miktar</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {totalQuantity.toFixed(2)}
              </p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <FiLayers className="text-2xl text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Toplam Değer</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                ₺{totalValue.toFixed(2)}
              </p>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <FiDollarSign className="text-2xl text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Stock Table */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Ürün</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">SKU</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Depo</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Miktar</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Birim</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Birim Fiyat</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Toplam Değer</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Durum</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {stocks.length > 0 ? (
                stocks.map((stock) => {
                  const quantity = parseFloat(stock.quantity || 0);
                  const costPrice = parseFloat(stock.product?.cost_price || 0);
                  const minStock = parseFloat(stock.product?.min_stock_level || 0);
                  const totalValue = quantity * costPrice;
                  
                  const getStockStatus = () => {
                    if (quantity === 0) return { text: 'Tükendi', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' };
                    if (quantity <= minStock) return { text: 'Düşük', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' };
                    return { text: 'Yeterli', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' };
                  };

                  const status = getStockStatus();

                  return (
                    <tr key={`${stock.product_id}-${stock.warehouse_id}`} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900 dark:text-white">
                          {stock.product?.name || 'Ürün Yok'}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {stock.product?.category?.name || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                        {stock.product?.sku || '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                        {stock.warehouse?.name || 'Depo Yok'}
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-medium text-gray-900 dark:text-white">
                        {quantity.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-right text-sm text-gray-600 dark:text-gray-300">
                        {stock.product?.unit?.abbreviation || stock.product?.unit?.name || '-'}
                      </td>
                      <td className="px-6 py-4 text-right text-sm text-gray-600 dark:text-gray-300">
                        ₺{costPrice.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-medium text-gray-900 dark:text-white">
                        ₺{totalValue.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${status.color}`}>
                          {status.text}
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="8" className="px-6 py-4 text-center text-gray-500">
                    Henüz stok bulunmuyor
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StockList;

