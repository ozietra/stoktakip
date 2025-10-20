import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import { FiPlus, FiEdit, FiTrash2, FiMail, FiPhone } from 'react-icons/fi';
import Modal from '../../components/Modal';
import toast from 'react-hot-toast';

const Suppliers = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    contact_person: '',
    email: '',
    phone: '',
    tax_office: '',
    tax_number: '',
    address: '',
    city: '',
    payment_term: 0,
    credit_limit: 0,
    discount_rate: 0,
    is_active: true
  });

  const { data, isLoading } = useQuery({
    queryKey: ['suppliers'],
    queryFn: async () => {
      const res = await api.get('/suppliers');
      return res.data.data;
    }
  });

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (selected) {
        await api.put(`/suppliers/${selected.id}`, data);
      } else {
        await api.post('/suppliers', data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['suppliers']);
      toast.success(t('messages.saveSuccess'));
      handleClose();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await api.delete(`/suppliers/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['suppliers']);
      toast.success(t('messages.deleteSuccess'));
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    saveMutation.mutate(formData);
  };

  const handleEdit = (item) => {
    setSelected(item);
    setFormData(item);
    setShowModal(true);
  };

  const handleAdd = () => {
    setSelected(null);
    setFormData({
      code: '',
      name: '',
      contact_person: '',
      email: '',
      phone: '',
      tax_office: '',
      tax_number: '',
      address: '',
      city: '',
      payment_term: 0,
      credit_limit: 0,
      discount_rate: 0,
      is_active: true
    });
    setShowModal(true);
  };

  const handleClose = () => {
    setShowModal(false);
    setSelected(null);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t('supplier.title')}
          </h1>
        </div>
        <button onClick={handleAdd} className="btn btn-primary flex items-center gap-2">
          <FiPlus />
          {t('supplier.addSupplier')}
        </button>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase">{t('supplier.code')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase">{t('supplier.name')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase">{t('supplier.contactPerson')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase">{t('supplier.phone')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase">{t('common.status')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase">{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {isLoading ? (
                <tr><td colSpan="6" className="px-6 py-4 text-center">{t('common.loading')}</td></tr>
              ) : data?.items?.length > 0 ? (
                data.items.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-6 py-4 text-sm">{item.code}</td>
                    <td className="px-6 py-4 text-sm">{item.name}</td>
                    <td className="px-6 py-4 text-sm">{item.contact_person || '-'}</td>
                    <td className="px-6 py-4 text-sm">{item.phone || '-'}</td>
                    <td className="px-6 py-4">
                      <span className={`badge ${item.is_active ? 'badge-success' : 'badge-gray'}`}>
                        {item.is_active ? t('common.active') : t('common.inactive')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <button onClick={() => handleEdit(item)} className="text-blue-600 hover:text-blue-900">
                          <FiEdit />
                        </button>
                        <button onClick={() => deleteMutation.mutate(item.id)} className="text-red-600 hover:text-red-900">
                          <FiTrash2 />
                        </button>
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

      <Modal
        isOpen={showModal}
        onClose={handleClose}
        title={selected ? t('supplier.editSupplier') : t('supplier.addSupplier')}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">{t('supplier.code')} *</label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({...formData, code: e.target.value})}
                className="input"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t('supplier.name')} *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="input"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t('supplier.contactPerson')}</label>
              <input
                type="text"
                value={formData.contact_person}
                onChange={(e) => setFormData({...formData, contact_person: e.target.value})}
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t('supplier.phone')}</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t('supplier.email')}</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t('supplier.city')}</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({...formData, city: e.target.value})}
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t('supplier.taxOffice')}</label>
              <input
                type="text"
                value={formData.tax_office}
                onChange={(e) => setFormData({...formData, tax_office: e.target.value})}
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t('supplier.taxNumber')}</label>
              <input
                type="text"
                value={formData.tax_number}
                onChange={(e) => setFormData({...formData, tax_number: e.target.value})}
                className="input"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">{t('supplier.address')}</label>
            <textarea
              value={formData.address}
              onChange={(e) => setFormData({...formData, address: e.target.value})}
              className="input"
              rows="2"
            />
          </div>

          <div className="flex items-center">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                className="rounded"
              />
              <span>{t('common.active')}</span>
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <button type="submit" className="btn btn-primary">{t('common.save')}</button>
            <button type="button" onClick={handleClose} className="btn btn-secondary">{t('common.cancel')}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Suppliers;
