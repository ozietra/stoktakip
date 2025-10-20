import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import { FiPlus, FiEye, FiTrash2 } from 'react-icons/fi';
import Modal from '../../components/Modal';
import ProductSelector from '../../components/ProductSelector';
import toast from 'react-hot-toast';

const Sales = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedSale, setSelectedSale] = useState(null);
  const [formData, setFormData] = useState({
    customer_id: null,
    warehouse_id: '',
    sale_date: new Date().toISOString().split('T')[0],
    payment_method: 'cash',
    status: 'pending',
    notes: ''
  });
  const [items, setItems] = useState([]);

  const { data, isLoading } = useQuery({
    queryKey: ['sales'],
    queryFn: async () => {
      const res = await api.get('/sales');
      return res.data.data;
    }
  });

  const { data: customersData } = useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      const res = await api.get('/customers');
      return res.data.data;
    }
  });

  const customers = customersData?.items || [];

  const { data: warehousesData } = useQuery({
    queryKey: ['warehouses'],
    queryFn: async () => {
      const res = await api.get('/warehouses');
      return res.data.data;
    }
  });

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

      const saleData = {
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

      await api.post('/sales', saleData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['sales']);
      queryClient.invalidateQueries(['dashboardStats']);
      toast.success(t('messages.saveSuccess'));
      setShowModal(false);
      setItems([]);
      setFormData({
        customer_id: null,
        warehouse_id: '',
        sale_date: new Date().toISOString().split('T')[0],
        payment_method: 'cash',
        status: 'pending',
        notes: ''
      });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || t('messages.error'));
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await api.delete(`/sales/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['sales']);
      toast.success('Satış silindi');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Satış silinemedi');
    }
  });

  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }) => {
      await api.put(`/sales/${id}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['sales']);
      toast.success('Satış durumu güncellendi');
      setShowViewModal(false);
      setSelectedSale(null);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Durum güncellenemedi');
    }
  });

  const handleView = async (sale) => {
    try {
      const response = await api.get(`/sales/${sale.id}`);
      setSelectedSale(response.data.data);
      setShowViewModal(true);
    } catch (error) {
      toast.error('Satış detayları yüklenemedi');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (items.length === 0) {
      toast.error('En az bir ürün eklemelisiniz!');
      return;
    }

    // Convert empty strings to null for optional fields
    const cleanedData = {
      ...formData,
      customer_id: formData.customer_id || null
    };
    saveMutation.mutate(cleanedData);
  };

  const getStatusBadge = (status) => {
    const badges = {
      draft: 'badge-gray',
      pending: 'badge-warning',
      confirmed: 'badge-success',
      shipped: 'badge-primary',
      delivered: 'badge-success',
      cancelled: 'badge-danger',
      returned: 'badge-warning'
    };
    return badges[status] || 'badge-gray';
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {t('sale.title')}
        </h1>
        <button onClick={() => setShowModal(true)} className="btn btn-primary flex items-center gap-2">
          <FiPlus />
          Yeni Satış
        </button>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase">{t('sale.saleNumber')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase">{t('sale.customer')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase">{t('sale.saleDate')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase">Toplam</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase">{t('common.status')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase">{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {isLoading ? (
                <tr><td colSpan="6" className="px-6 py-4 text-center">{t('common.loading')}</td></tr>
              ) : data?.items?.length > 0 ? (
                data.items.map((sale) => (
                  <tr key={sale.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-6 py-4 text-sm font-medium">{sale.sale_number}</td>
                    <td className="px-6 py-4 text-sm">{sale.customer?.name || 'Perakende'}</td>
                    <td className="px-6 py-4 text-sm">
                      {new Date(sale.sale_date).toLocaleDateString('tr-TR')}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      ₺{parseFloat(sale.total_amount).toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`badge ${getStatusBadge(sale.status)}`}>
                        {t(`sale.status.${sale.status}`)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={() => handleView(sale)}
                          className="text-blue-600 hover:text-blue-800 dark:hover:text-blue-400" 
                          title="Görüntüle"
                        >
                          <FiEye size={18} />
                        </button>
                        {['pending', 'cancelled'].includes(sale.status) && (
                          <button 
                            onClick={() => {
                              if (window.confirm('Bu satışı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.')) {
                                deleteMutation.mutate(sale.id);
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

      <Modal isOpen={showModal} onClose={() => { setShowModal(false); setItems([]); }} title="Yeni Satış" size="xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">{t('sale.customer')}</label>
              <select 
                value={formData.customer_id || ''} 
                onChange={(e) => setFormData({...formData, customer_id: e.target.value || null})} 
                className="input"
              >
                <option value="">Perakende Satış</option>
                {customers.map(customer => (
                  <option key={customer.id} value={customer.id}>{customer.name}</option>
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
              <label className="block text-sm font-medium mb-1">{t('sale.saleDate')}</label>
              <input 
                type="date" 
                value={formData.sale_date} 
                onChange={(e) => setFormData({...formData, sale_date: e.target.value})} 
                className="input"
                required 
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Ödeme Yöntemi</label>
              <select 
                value={formData.payment_method} 
                onChange={(e) => setFormData({...formData, payment_method: e.target.value})} 
                className="input"
              >
                <option value="cash">{t('sale.paymentMethod.cash')}</option>
                <option value="credit_card">{t('sale.paymentMethod.credit_card')}</option>
                <option value="bank_transfer">{t('sale.paymentMethod.bank_transfer')}</option>
                <option value="check">{t('sale.paymentMethod.check')}</option>
                <option value="other">{t('sale.paymentMethod.other')}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t('common.status')}</label>
              <select 
                value={formData.status} 
                onChange={(e) => setFormData({...formData, status: e.target.value})} 
                className="input"
              >
                <option value="draft">{t('sale.status.draft')}</option>
                <option value="pending">{t('sale.status.pending')}</option>
                <option value="confirmed">{t('sale.status.confirmed')}</option>
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

      {/* View Sale Modal */}
      <Modal 
        isOpen={showViewModal} 
        onClose={() => { setShowViewModal(false); setSelectedSale(null); }} 
        title="Satış Detayları" 
        size="xl"
      >
        {selectedSale && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Satış No</p>
                <p className="font-semibold">{selectedSale.sale_number}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Müşteri</p>
                <p className="font-semibold">{selectedSale.customer?.name || 'Perakende'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Depo</p>
                <p className="font-semibold">{selectedSale.warehouse?.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Satış Tarihi</p>
                <p className="font-semibold">{new Date(selectedSale.sale_date).toLocaleDateString('tr-TR')}</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Satış Durumu</p>
                <select
                  value={selectedSale.status}
                  onChange={(e) => updateStatusMutation.mutate({ id: selectedSale.id, status: e.target.value })}
                  className="input w-full"
                >
                  <option value="draft">Taslak</option>
                  <option value="pending">Beklemede</option>
                  <option value="confirmed">Onaylandı</option>
                  <option value="shipped">Kargoya Verildi</option>
                  <option value="delivered">Teslim Edildi</option>
                  <option value="cancelled">İptal Edildi</option>
                  <option value="returned">İade Edildi</option>
                </select>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-gray-600 dark:text-gray-400">Toplam Tutar</p>
                <p className="font-semibold text-lg">₺{parseFloat(selectedSale.total_amount || 0).toFixed(2)}</p>
              </div>
            </div>

            {selectedSale.notes && (
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Notlar</p>
                <p className="text-sm p-3 bg-gray-50 dark:bg-gray-700/30 rounded">{selectedSale.notes}</p>
              </div>
            )}

            {selectedSale.items && selectedSale.items.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3">Satış Kalemleri</h3>
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
                      {selectedSale.items.map((item, idx) => (
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
                onClick={() => { setShowViewModal(false); setSelectedSale(null); }} 
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

export default Sales;
