import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import { FiPlus, FiArrowDown, FiArrowUp, FiRefreshCw } from 'react-icons/fi';
import Modal from '../../components/Modal';
import toast from 'react-hot-toast';

const StockMovements = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('in'); // in, out, transfer
  const [formData, setFormData] = useState({
    product_id: '',
    warehouse_id: '',
    location_id: null,
    quantity: '',
    unit_price: '',
    notes: ''
  });

  const { data: movements, isLoading } = useQuery({
    queryKey: ['stock-movements'],
    queryFn: async () => {
      const res = await api.get('/stock-movements');
      return res.data.data;
    }
  });

  const { data: products } = useQuery({
    queryKey: ['products-all'],
    queryFn: async () => {
      const res = await api.get('/products');
      return res.data.data;
    }
  });

  const { data: warehouses } = useQuery({
    queryKey: ['warehouses'],
    queryFn: async () => {
      const res = await api.get('/warehouses');
      return res.data.data;
    }
  });

  const movementMutation = useMutation({
    mutationFn: async (data) => {
      const endpoint = modalType === 'in' ? '/stock-movements/in' : '/stock-movements/out';
      await api.post(endpoint, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['stock-movements']);
      toast.success(t('messages.saveSuccess'));
      setShowModal(false);
      resetForm();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || t('messages.error'));
    }
  });

  const resetForm = () => {
    setFormData({
      product_id: '',
      warehouse_id: '',
      location_id: null,
      quantity: '',
      unit_price: '',
      notes: ''
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    movementMutation.mutate(formData);
  };

  const openModal = (type) => {
    setModalType(type);
    resetForm();
    setShowModal(true);
  };

  const getMovementBadge = (type) => {
    const badges = {
      in: { class: 'badge-success', icon: <FiArrowDown />, text: 'Giriş' },
      out: { class: 'badge-danger', icon: <FiArrowUp />, text: 'Çıkış' },
      transfer: { class: 'badge-primary', icon: <FiRefreshCw />, text: 'Transfer' },
      adjustment: { class: 'badge-warning', icon: <FiRefreshCw />, text: 'Düzeltme' }
    };
    return badges[type] || badges.in;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t('stock.title')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Stok giriş, çıkış ve transfer işlemlerini yönetin
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => openModal('in')} className="btn btn-success flex items-center gap-2">
            <FiArrowDown />
            {t('stock.stockIn')}
          </button>
          <button onClick={() => openModal('out')} className="btn btn-danger flex items-center gap-2">
            <FiArrowUp />
            {t('stock.stockOut')}
          </button>
        </div>
      </div>

      {/* Movements Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Tarih
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Ürün
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Depo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Tip
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Miktar
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Tutar
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {isLoading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center">{t('common.loading')}</td>
                </tr>
              ) : movements?.items?.length > 0 ? (
                movements.items.map((movement) => {
                  const badge = getMovementBadge(movement.type);
                  return (
                    <tr key={movement.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {new Date(movement.movement_date).toLocaleDateString('tr-TR')}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {movement.product?.name}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {movement.warehouse?.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`badge ${badge.class} flex items-center gap-1 w-fit`}>
                          {badge.icon} {badge.text}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {movement.quantity}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        ₺{parseFloat(movement.total_price).toFixed(2)}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center">{t('messages.noData')}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={modalType === 'in' ? t('stock.stockIn') : t('stock.stockOut')}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              {t('product.name')} *
            </label>
            <select
              value={formData.product_id}
              onChange={(e) => setFormData({...formData, product_id: e.target.value})}
              className="input"
              required
            >
              <option value="">Seçiniz</option>
              {products?.items?.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              {t('warehouse.name')} *
            </label>
            <select
              value={formData.warehouse_id}
              onChange={(e) => setFormData({...formData, warehouse_id: e.target.value})}
              className="input"
              required
            >
              <option value="">Seçiniz</option>
              {warehouses?.map(w => (
                <option key={w.id} value={w.id}>{w.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              {t('stock.quantity')} *
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.quantity}
              onChange={(e) => setFormData({...formData, quantity: e.target.value})}
              className="input"
              required
            />
          </div>

          {modalType === 'in' && (
            <div>
              <label className="block text-sm font-medium mb-1">
                {t('stock.unitPrice')}
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.unit_price}
                onChange={(e) => setFormData({...formData, unit_price: e.target.value})}
                className="input"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1">
              {t('product.notes')}
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              className="input"
              rows="3"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button type="submit" className="btn btn-primary">
              {t('common.save')}
            </button>
            <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">
              {t('common.cancel')}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default StockMovements;
