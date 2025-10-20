import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import { FiPlus, FiEdit, FiTrash2 } from 'react-icons/fi';
import Modal from '../../components/Modal';
import toast from 'react-hot-toast';

const Customers = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    type: 'individual',
    contact_person: '',
    email: '',
    phone: '',
    mobile: '',
    tax_office: '',
    tax_number: '',
    identity_number: '',
    address: '',
    city: '',
    price_group: 'standard',
    is_active: true
  });

  const { data, isLoading } = useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      const res = await api.get('/customers');
      return res.data.data;
    }
  });

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (selected) {
        await api.put(`/customers/${selected.id}`, data);
      } else {
        await api.post('/customers', data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['customers']);
      toast.success(t('messages.saveSuccess'));
      handleClose();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await api.delete(`/customers/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['customers']);
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
      type: 'individual',
      contact_person: '',
      email: '',
      phone: '',
      mobile: '',
      tax_office: '',
      tax_number: '',
      identity_number: '',
      address: '',
      city: '',
      price_group: 'standard',
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
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {t('customer.title')}
        </h1>
        <button onClick={handleAdd} className="btn btn-primary flex items-center gap-2">
          <FiPlus />
          {t('customer.addCustomer')}
        </button>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase">{t('customer.code')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase">{t('customer.name')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase">{t('customer.type')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase">{t('customer.phone')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase">{t('customer.priceGroup')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase">{t('common.status')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase">{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {isLoading ? (
                <tr><td colSpan="7" className="px-6 py-4 text-center">{t('common.loading')}</td></tr>
              ) : data?.items?.length > 0 ? (
                data.items.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-6 py-4 text-sm">{item.code}</td>
                    <td className="px-6 py-4 text-sm">{item.name}</td>
                    <td className="px-6 py-4 text-sm">{t(`customer.${item.type}`)}</td>
                    <td className="px-6 py-4 text-sm">{item.phone || item.mobile || '-'}</td>
                    <td className="px-6 py-4 text-sm">{t(`customer.${item.price_group}`)}</td>
                    <td className="px-6 py-4">
                      <span className={`badge ${item.is_active ? 'badge-success' : 'badge-gray'}`}>
                        {item.is_active ? t('common.active') : t('common.inactive')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <button onClick={() => handleEdit(item)} className="text-blue-600">
                          <FiEdit />
                        </button>
                        <button onClick={() => deleteMutation.mutate(item.id)} className="text-red-600">
                          <FiTrash2 />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="7" className="px-6 py-4 text-center">{t('messages.noData')}</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={showModal} onClose={handleClose} title={selected ? t('customer.editCustomer') : t('customer.addCustomer')} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">{t('customer.code')} *</label>
              <input type="text" value={formData.code} onChange={(e) => setFormData({...formData, code: e.target.value})} className="input" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t('customer.name')} *</label>
              <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="input" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t('customer.type')}</label>
              <select value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})} className="input">
                <option value="individual">{t('customer.individual')}</option>
                <option value="corporate">{t('customer.corporate')}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t('customer.priceGroup')}</label>
              <select value={formData.price_group} onChange={(e) => setFormData({...formData, price_group: e.target.value})} className="input">
                <option value="standard">{t('customer.standard')}</option>
                <option value="wholesale">{t('customer.wholesale')}</option>
                <option value="vip">{t('customer.vip')}</option>
                <option value="special">{t('customer.special')}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t('customer.phone')}</label>
              <input type="text" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="input" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t('customer.email')}</label>
              <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="input" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">{t('customer.address')}</label>
            <textarea value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} className="input" rows="2" />
          </div>

          <div className="flex items-center">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={formData.is_active} onChange={(e) => setFormData({...formData, is_active: e.target.checked})} className="rounded" />
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

export default Customers;
