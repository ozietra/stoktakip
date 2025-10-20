import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import { FiPlus, FiEdit, FiTrash2 } from 'react-icons/fi';
import Modal from '../../components/Modal';
import toast from 'react-hot-toast';

const Categories = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    name_en: '',
    description: ''
  });

  const { data, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await api.get('/categories');
      return res.data.data;
    }
  });

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (selected) {
        await api.put(`/categories/${selected.id}`, data);
      } else {
        await api.post('/categories', data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['categories']);
      toast.success(t('messages.saveSuccess'));
      handleClose();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await api.delete(`/categories/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['categories']);
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
    setFormData({ name: '', name_en: '', description: '' });
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
          {t('category.title')}
        </h1>
        <button onClick={handleAdd} className="btn btn-primary flex items-center gap-2">
          <FiPlus />
          {t('category.addCategory')}
        </button>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase">{t('category.name')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase">{t('category.description')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase">{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {isLoading ? (
                <tr><td colSpan="3" className="px-6 py-4 text-center">{t('common.loading')}</td></tr>
              ) : data?.length > 0 ? (
                data.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-6 py-4 text-sm font-medium">{item.name}</td>
                    <td className="px-6 py-4 text-sm">{item.description || '-'}</td>
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
                <tr><td colSpan="3" className="px-6 py-4 text-center">{t('messages.noData')}</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={showModal} onClose={handleClose} title={selected ? t('category.editCategory') : t('category.addCategory')}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">{t('category.name')} (TR) *</label>
            <input 
              type="text" 
              value={formData.name} 
              onChange={(e) => setFormData({...formData, name: e.target.value})} 
              className="input" 
              required 
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t('category.name')} (EN)</label>
            <input 
              type="text" 
              value={formData.name_en || ''} 
              onChange={(e) => setFormData({...formData, name_en: e.target.value})} 
              className="input" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t('category.description')}</label>
            <textarea 
              value={formData.description || ''} 
              onChange={(e) => setFormData({...formData, description: e.target.value})} 
              className="input" 
              rows="3"
            />
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

export default Categories;

