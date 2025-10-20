import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import { FiPlus, FiEdit2, FiTrash2, FiCalendar, FiPercent, FiDollarSign } from 'react-icons/fi';
import Modal from '../../components/Modal';
import toast from 'react-hot-toast';

const Campaigns = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    type: 'percentage',
    discount_value: '',
    min_purchase_amount: '0',
    max_discount_amount: '',
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    is_active: true,
    applicable_to: 'all'
  });

  const { data: campaigns, isLoading } = useQuery({
    queryKey: ['campaigns'],
    queryFn: async () => {
      const res = await api.get('/campaigns');
      return res.data.data;
    }
  });

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (editingCampaign) {
        await api.put(`/campaigns/${editingCampaign.id}`, data);
      } else {
        await api.post('/campaigns', data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['campaigns']);
      toast.success(editingCampaign ? 'Kampanya güncellendi' : 'Kampanya oluşturuldu');
      handleCloseModal();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Bir hata oluştu');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await api.delete(`/campaigns/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['campaigns']);
      toast.success('Kampanya silindi');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Bir hata oluştu');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    saveMutation.mutate(formData);
  };

  const handleEdit = (campaign) => {
    setEditingCampaign(campaign);
    setFormData({
      code: campaign.code,
      name: campaign.name,
      description: campaign.description || '',
      type: campaign.type,
      discount_value: campaign.discount_value,
      min_purchase_amount: campaign.min_purchase_amount || '0',
      max_discount_amount: campaign.max_discount_amount || '',
      start_date: campaign.start_date.split('T')[0],
      end_date: campaign.end_date.split('T')[0],
      is_active: campaign.is_active,
      applicable_to: campaign.applicable_to
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCampaign(null);
    setFormData({
      code: '',
      name: '',
      description: '',
      type: 'percentage',
      discount_value: '',
      min_purchase_amount: '0',
      max_discount_amount: '',
      start_date: new Date().toISOString().split('T')[0],
      end_date: '',
      is_active: true,
      applicable_to: 'all'
    });
  };

  const getCampaignTypeIcon = (type) => {
    switch (type) {
      case 'percentage':
        return <FiPercent className="text-blue-600" />;
      case 'fixed_amount':
        return <FiDollarSign className="text-green-600" />;
      default:
        return <FiPercent className="text-gray-600" />;
    }
  };

  const getCampaignTypeText = (type) => {
    const types = {
      percentage: '% İndirim',
      fixed_amount: 'Sabit Tutar',
      buy_x_get_y: 'Al-Kazan',
      free_shipping: 'Ücretsiz Kargo'
    };
    return types[type] || type;
  };

  const isActive = (campaign) => {
    if (!campaign.is_active) return false;
    const now = new Date();
    const start = new Date(campaign.start_date);
    const end = new Date(campaign.end_date);
    return now >= start && now <= end;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            🎉 Kampanyalar
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            İndirim ve kampanyalarınızı yönetin
          </p>
        </div>
        <button 
          onClick={() => setShowModal(true)} 
          className="btn btn-primary flex items-center gap-2"
        >
          <FiPlus />
          Yeni Kampanya
        </button>
      </div>

      {/* Campaigns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full card p-8 text-center">
            <p className="text-gray-600 dark:text-gray-400">{t('common.loading')}</p>
          </div>
        ) : campaigns?.length > 0 ? (
          campaigns.map((campaign) => (
            <div 
              key={campaign.id} 
              className={`card p-6 relative ${
                isActive(campaign) 
                  ? 'border-2 border-green-500 dark:border-green-400' 
                  : 'opacity-75'
              }`}
            >
              {isActive(campaign) && (
                <div className="absolute top-2 right-2">
                  <span className="badge badge-success text-xs">Aktif</span>
                </div>
              )}
              
              <div className="flex items-start gap-3 mb-4">
                <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                  {getCampaignTypeIcon(campaign.type)}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                    {campaign.name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {campaign.code}
                  </p>
                </div>
              </div>

              {campaign.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  {campaign.description}
                </p>
              )}

              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Tip:</span>
                  <span className="font-medium">{getCampaignTypeText(campaign.type)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">İndirim:</span>
                  <span className="font-semibold text-green-600 dark:text-green-400">
                    {campaign.type === 'percentage' 
                      ? `%${campaign.discount_value}` 
                      : `₺${parseFloat(campaign.discount_value).toFixed(2)}`}
                  </span>
                </div>
                {campaign.min_purchase_amount > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Min Alış:</span>
                    <span className="font-medium">₺{parseFloat(campaign.min_purchase_amount).toFixed(2)}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-4">
                <FiCalendar />
                <span>
                  {new Date(campaign.start_date).toLocaleDateString('tr-TR')} - {new Date(campaign.end_date).toLocaleDateString('tr-TR')}
                </span>
              </div>

              <div className="flex gap-2 pt-4 border-t dark:border-gray-700">
                <button
                  onClick={() => handleEdit(campaign)}
                  className="flex-1 btn btn-secondary btn-sm flex items-center justify-center gap-1"
                >
                  <FiEdit2 size={14} />
                  Düzenle
                </button>
                <button
                  onClick={() => {
                    if (window.confirm('Bu kampanyayı silmek istediğinize emin misiniz?')) {
                      deleteMutation.mutate(campaign.id);
                    }
                  }}
                  className="flex-1 btn btn-danger btn-sm flex items-center justify-center gap-1"
                >
                  <FiTrash2 size={14} />
                  Sil
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full card p-8 text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Henüz Kampanya Yok
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              İlk kampanyanızı oluşturarak müşterilerinize özel fırsatlar sunun
            </p>
            <button 
              onClick={() => setShowModal(true)} 
              className="btn btn-primary inline-flex items-center gap-2"
            >
              <FiPlus />
              Kampanya Oluştur
            </button>
          </div>
        )}
      </div>

      {/* Campaign Modal */}
      <Modal 
        isOpen={showModal} 
        onClose={handleCloseModal} 
        title={editingCampaign ? 'Kampanya Düzenle' : 'Yeni Kampanya'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Kampanya Kodu *</label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({...formData, code: e.target.value})}
                className="input"
                required
                placeholder="YILBASI2024"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Kampanya Türü *</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value})}
                className="input"
                required
              >
                <option value="percentage">% İndirim</option>
                <option value="fixed_amount">Sabit Tutar</option>
                <option value="buy_x_get_y">Al-Kazan</option>
                <option value="free_shipping">Ücretsiz Kargo</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Kampanya Adı *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="input"
              required
              placeholder="Yılbaşı Kampanyası"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Açıklama</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="input"
              rows="3"
              placeholder="Kampanya hakkında açıklama..."
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">İndirim Değeri *</label>
              <input
                type="number"
                step="0.01"
                value={formData.discount_value}
                onChange={(e) => setFormData({...formData, discount_value: e.target.value})}
                className="input"
                required
                placeholder={formData.type === 'percentage' ? '10' : '50'}
              />
              <span className="text-xs text-gray-500">
                {formData.type === 'percentage' ? '% olarak' : '₺ olarak'}
              </span>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Min Alış Tutarı</label>
              <input
                type="number"
                step="0.01"
                value={formData.min_purchase_amount}
                onChange={(e) => setFormData({...formData, min_purchase_amount: e.target.value})}
                className="input"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Max İndirim</label>
              <input
                type="number"
                step="0.01"
                value={formData.max_discount_amount}
                onChange={(e) => setFormData({...formData, max_discount_amount: e.target.value})}
                className="input"
                placeholder="Limit yok"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Başlangıç Tarihi *</label>
              <input
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                className="input"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Bitiş Tarihi *</label>
              <input
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                className="input"
                required
              />
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                className="rounded"
              />
              <span className="text-sm font-medium">Kampanya Aktif</span>
            </label>
          </div>

          <div className="flex gap-3 pt-4 border-t dark:border-gray-700">
            <button type="submit" className="btn btn-primary flex-1">
              {editingCampaign ? 'Güncelle' : 'Oluştur'}
            </button>
            <button type="button" onClick={handleCloseModal} className="btn btn-secondary flex-1">
              İptal
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Campaigns;
