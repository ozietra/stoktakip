import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import { FiPlus, FiEdit, FiTrash2, FiMapPin } from 'react-icons/fi';
import Modal from '../../components/Modal';
import toast from 'react-hot-toast';

const Warehouses = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    address: '',
    city: '',
    country: 'Türkiye',
    phone: '',
    manager_name: '',
    is_active: true,
    is_main: false
  });

  const { data: warehouses, isLoading } = useQuery({
    queryKey: ['warehouses'],
    queryFn: async () => {
      const res = await api.get('/warehouses');
      return res.data.data;
    }
  });

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (selectedWarehouse) {
        await api.put(`/warehouses/${selectedWarehouse.id}`, data);
      } else {
        await api.post('/warehouses', data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['warehouses']);
      toast.success(t('messages.saveSuccess'));
      handleClose();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || t('messages.error'));
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await api.delete(`/warehouses/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['warehouses']);
      toast.success(t('messages.deleteSuccess'));
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    saveMutation.mutate(formData);
  };

  const handleEdit = (warehouse) => {
    setSelectedWarehouse(warehouse);
    setFormData(warehouse);
    setShowModal(true);
  };

  const handleAdd = () => {
    setSelectedWarehouse(null);
    setFormData({
      name: '',
      code: '',
      description: '',
      address: '',
      city: '',
      country: 'Türkiye',
      phone: '',
      manager_name: '',
      is_active: true,
      is_main: false
    });
    setShowModal(true);
  };

  const handleClose = () => {
    setShowModal(false);
    setSelectedWarehouse(null);
  };

  const handleDelete = (id) => {
    if (window.confirm(t('messages.confirmDelete'))) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t('warehouse.title')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Tüm depoları görüntüleyin ve yönetin
          </p>
        </div>
        <button onClick={handleAdd} className="btn btn-primary flex items-center gap-2">
          <FiPlus />
          {t('warehouse.addWarehouse')}
        </button>
      </div>

      {/* Warehouses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full text-center py-8">{t('common.loading')}</div>
        ) : warehouses?.length > 0 ? (
          warehouses.map((warehouse) => (
            <div key={warehouse.id} className="card p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <FiMapPin className="text-primary-600" />
                    {warehouse.name}
                    {warehouse.is_main && (
                      <span className="badge badge-primary text-xs">Ana Depo</span>
                    )}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{warehouse.code}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(warehouse)}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    <FiEdit />
                  </button>
                  <button
                    onClick={() => handleDelete(warehouse.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                {warehouse.city && (
                  <p className="text-gray-600 dark:text-gray-400">
                    <strong>Şehir:</strong> {warehouse.city}
                  </p>
                )}
                {warehouse.phone && (
                  <p className="text-gray-600 dark:text-gray-400">
                    <strong>Telefon:</strong> {warehouse.phone}
                  </p>
                )}
                {warehouse.manager_name && (
                  <p className="text-gray-600 dark:text-gray-400">
                    <strong>Yönetici:</strong> {warehouse.manager_name}
                  </p>
                )}
                <div className="pt-2">
                  <span className={`badge ${warehouse.is_active ? 'badge-success' : 'badge-gray'}`}>
                    {warehouse.is_active ? t('common.active') : t('common.inactive')}
                  </span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-8">{t('messages.noData')}</div>
        )}
      </div>

      {/* Modal */}
      <Modal
        isOpen={showModal}
        onClose={handleClose}
        title={selectedWarehouse ? t('warehouse.editWarehouse') : t('warehouse.addWarehouse')}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                {t('warehouse.name')} *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="input"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                {t('warehouse.code')} *
              </label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({...formData, code: e.target.value})}
                className="input"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                {t('warehouse.city')}
              </label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({...formData, city: e.target.value})}
                className="input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                {t('warehouse.phone')}
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                {t('warehouse.manager')}
              </label>
              <input
                type="text"
                value={formData.manager_name}
                onChange={(e) => setFormData({...formData, manager_name: e.target.value})}
                className="input"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              {t('warehouse.address')}
            </label>
            <textarea
              value={formData.address}
              onChange={(e) => setFormData({...formData, address: e.target.value})}
              className="input"
              rows="3"
            />
          </div>

          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                className="rounded"
              />
              <span>{t('common.active')}</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.is_main}
                onChange={(e) => setFormData({...formData, is_main: e.target.checked})}
                className="rounded"
              />
              <span>{t('warehouse.isMain')}</span>
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <button type="submit" className="btn btn-primary">
              {t('common.save')}
            </button>
            <button type="button" onClick={handleClose} className="btn btn-secondary">
              {t('common.cancel')}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Warehouses;
