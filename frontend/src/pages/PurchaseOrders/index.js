import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import { FiPlus, FiEye, FiTrash2 } from 'react-icons/fi';
import Modal from '../../components/Modal';
import ProductSelector from '../../components/ProductSelector';
import toast from 'react-hot-toast';

const PurchaseOrders = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [formData, setFormData] = useState({
    supplier_id: '',
    warehouse_id: '',
    order_date: new Date().toISOString().split('T')[0],
    expected_delivery: '',
    status: 'draft',
    notes: ''
  });
  const [items, setItems] = useState([]);

  const { data, isLoading } = useQuery({
    queryKey: ['purchase-orders'],
    queryFn: async () => {
      const res = await api.get('/purchase-orders');
      return res.data.data;
    }
  });

  const { data: suppliersData } = useQuery({
    queryKey: ['suppliers'],
    queryFn: async () => {
      const res = await api.get('/suppliers');
      return res.data.data;
    }
  });

  const { data: warehousesData } = useQuery({
    queryKey: ['warehouses'],
    queryFn: async () => {
      const res = await api.get('/warehouses');
      return res.data.data;
    }
  });

  const suppliers = suppliersData?.items || [];
  const warehouses = warehousesData || [];

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      // Calculate total from items
      const total_amount = items.reduce((sum, item) => {
        const subtotal = item.quantity * item.unit_price;
        const afterDiscount = subtotal - (subtotal * (item.discount || 0) / 100);
        const total = afterDiscount + (afterDiscount * (item.tax_rate || 0) / 100);
        return sum + total;
      }, 0);

      const orderData = {
        ...data,
        total_amount,
        items: items.map(item => ({
          product_id: parseInt(item.product_id),
          quantity: parseFloat(item.quantity),
          unit_price: parseFloat(item.unit_price),
          discount_percentage: parseFloat(item.discount || 0),
          tax_rate: parseFloat(item.tax_rate || 0),
          total_price: (() => {
            const subtotal = item.quantity * item.unit_price;
            const afterDiscount = subtotal - (subtotal * (item.discount || 0) / 100);
            return afterDiscount + (afterDiscount * (item.tax_rate || 0) / 100);
          })()
        }))
      };

      await api.post('/purchase-orders', orderData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['purchase-orders']);
      queryClient.invalidateQueries(['dashboardStats']);
      toast.success(t('messages.saveSuccess'));
      setShowModal(false);
      setItems([]);
      setFormData({
        supplier_id: '',
        warehouse_id: '',
        order_date: new Date().toISOString().split('T')[0],
        expected_delivery: '',
        status: 'draft',
        notes: ''
      });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || t('messages.error'));
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (items.length === 0) {
      toast.error('En az bir ürün eklemelisiniz!');
      return;
    }

    saveMutation.mutate(formData);
  };

  const getStatusBadge = (status) => {
    const badges = {
      draft: 'badge-gray',
      pending: 'badge-warning',
      approved: 'badge-primary',
      ordered: 'badge-primary',
      partially_received: 'badge-warning',
      received: 'badge-success',
      cancelled: 'badge-danger'
    };
    return badges[status] || 'badge-gray';
  };

  const handleViewOrder = async (orderId) => {
    try {
      const res = await api.get(`/purchase-orders/${orderId}`);
      setSelectedOrder(res.data.data);
      setShowViewModal(true);
    } catch (error) {
      toast.error('Sipariş detayları yüklenemedi');
    }
  };

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }) => {
      await api.put(`/purchase-orders/${id}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['purchase-orders']);
      toast.success('Sipariş durumu güncellendi');
      setShowViewModal(false);
      setSelectedOrder(null);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Durum güncellenemedi');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await api.delete(`/purchase-orders/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['purchase-orders']);
      toast.success('Sipariş silindi');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Sipariş silinemedi');
    }
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {t('purchase.title')}
        </h1>
        <button onClick={() => setShowModal(true)} className="btn btn-primary flex items-center gap-2">
          <FiPlus />
          Yeni Sipariş
        </button>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase">{t('purchase.orderNumber')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase">{t('purchase.supplier')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase">{t('purchase.orderDate')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase">Toplam</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase">{t('common.status')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase">{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {isLoading ? (
                <tr><td colSpan="6" className="px-6 py-4 text-center">{t('common.loading')}</td></tr>
              ) : data?.items?.length > 0 ? (
                data.items.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-6 py-4 text-sm font-medium">{order.order_number}</td>
                    <td className="px-6 py-4 text-sm">{order.supplier?.name}</td>
                    <td className="px-6 py-4 text-sm">
                      {new Date(order.order_date).toLocaleDateString('tr-TR')}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      ₺{parseFloat(order.total_amount).toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`badge ${getStatusBadge(order.status)}`}>
                        {t(`purchase.status.${order.status}`)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={() => handleViewOrder(order.id)}
                          className="text-blue-600 hover:text-blue-800 dark:hover:text-blue-400"
                          title="Görüntüle"
                        >
                          <FiEye size={18} />
                        </button>
                        {['draft', 'cancelled'].includes(order.status) && (
                          <button 
                            onClick={() => {
                              if (window.confirm('Bu siparişi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.')) {
                                deleteMutation.mutate(order.id);
                              }
                            }}
                            className="text-red-600 hover:text-red-800 dark:hover:text-red-400"
                            title="Sil"
                          >
                            <FiTrash2 size={18} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="6" className="px-6 py-4 text-center">{t('messages.noData')}</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={showModal} onClose={() => { setShowModal(false); setItems([]); }} title="Yeni Satın Alma Siparişi" size="xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">{t('purchase.supplier')} *</label>
              <select 
                value={formData.supplier_id} 
                onChange={(e) => setFormData({...formData, supplier_id: e.target.value})} 
                className="input"
                required
              >
                <option value="">Tedarikçi Seçin</option>
                {suppliers.map(supplier => (
                  <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t('stock.warehouse')} *</label>
              <select 
                value={formData.warehouse_id} 
                onChange={(e) => setFormData({...formData, warehouse_id: e.target.value})} 
                className="input"
                required
              >
                <option value="">Depo Seçin</option>
                {warehouses.map(warehouse => (
                  <option key={warehouse.id} value={warehouse.id}>{warehouse.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t('purchase.orderDate')}</label>
              <input 
                type="date" 
                value={formData.order_date} 
                onChange={(e) => setFormData({...formData, order_date: e.target.value})} 
                className="input"
                required 
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t('purchase.expectedDelivery')}</label>
              <input 
                type="date" 
                value={formData.expected_delivery} 
                onChange={(e) => setFormData({...formData, expected_delivery: e.target.value})} 
                className="input"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">{t('common.status')}</label>
              <select 
                value={formData.status} 
                onChange={(e) => setFormData({...formData, status: e.target.value})} 
                className="input"
              >
                <option value="draft">{t('purchase.status.draft')}</option>
                <option value="pending">{t('purchase.status.pending')}</option>
                <option value="approved">{t('purchase.status.approved')}</option>
              </select>
            </div>
          </div>

          {/* Product Selector */}
          <div className="border-t dark:border-gray-700 pt-4">
            <ProductSelector items={items} onChange={setItems} />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Notlar</label>
            <textarea 
              value={formData.notes} 
              onChange={(e) => setFormData({...formData, notes: e.target.value})} 
              className="input" 
              rows="3"
            />
          </div>
          <div className="flex gap-3 pt-4 border-t dark:border-gray-700">
            <button type="submit" className="btn btn-primary" disabled={saveMutation.isLoading}>
              {saveMutation.isLoading ? 'Kaydediliyor...' : t('common.save')}
            </button>
            <button type="button" onClick={() => { setShowModal(false); setItems([]); }} className="btn btn-secondary">{t('common.cancel')}</button>
          </div>
        </form>
      </Modal>

      {/* View Order Modal */}
      <Modal 
        isOpen={showViewModal} 
        onClose={() => { setShowViewModal(false); setSelectedOrder(null); }} 
        title="Sipariş Detayları" 
        size="xl"
      >
        {selectedOrder && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Sipariş No</p>
                <p className="font-semibold">{selectedOrder.order_number}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Tedarikçi</p>
                <p className="font-semibold">{selectedOrder.supplier?.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Depo</p>
                <p className="font-semibold">{selectedOrder.warehouse?.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Sipariş Tarihi</p>
                <p className="font-semibold">{new Date(selectedOrder.order_date).toLocaleDateString('tr-TR')}</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Sipariş Durumu</p>
                <select
                  value={selectedOrder.status}
                  onChange={(e) => updateStatusMutation.mutate({ id: selectedOrder.id, status: e.target.value })}
                  className="input w-full"
                >
                  <option value="draft">Taslak</option>
                  <option value="pending">Beklemede</option>
                  <option value="approved">Onaylandı</option>
                  <option value="ordered">Sipariş Verildi</option>
                  <option value="partially_received">Kısmi Teslim Alındı</option>
                  <option value="received">Teslim Alındı</option>
                  <option value="cancelled">İptal Edildi</option>
                </select>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-gray-600 dark:text-gray-400">Toplam Tutar</p>
                <p className="font-semibold text-lg">₺{parseFloat(selectedOrder.total_amount || 0).toFixed(2)}</p>
              </div>
            </div>

            {selectedOrder.notes && (
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Notlar</p>
                <p className="text-sm p-3 bg-gray-50 dark:bg-gray-700/30 rounded">{selectedOrder.notes}</p>
              </div>
            )}

            {selectedOrder.items && selectedOrder.items.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3">Sipariş Kalemleri</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 dark:bg-gray-700/50">
                      <tr>
                        <th className="px-4 py-2 text-left">Ürün</th>
                        <th className="px-4 py-2 text-right">Miktar</th>
                        <th className="px-4 py-2 text-right">Birim Fiyat</th>
                        <th className="px-4 py-2 text-right">Toplam</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {selectedOrder.items.map((item, idx) => (
                        <tr key={idx}>
                          <td className="px-4 py-2">{item.product?.name || 'Ürün Yok'}</td>
                          <td className="px-4 py-2 text-right">{item.quantity}</td>
                          <td className="px-4 py-2 text-right">₺{parseFloat(item.unit_price).toFixed(2)}</td>
                          <td className="px-4 py-2 text-right">₺{parseFloat(item.total_price).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-4 border-t dark:border-gray-700">
              <button 
                type="button" 
                onClick={() => { setShowViewModal(false); setSelectedOrder(null); }} 
                className="btn btn-secondary"
              >
                Kapat
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default PurchaseOrders;
