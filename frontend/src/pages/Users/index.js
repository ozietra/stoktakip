import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import { FiPlus, FiEdit2, FiTrash2, FiUser } from 'react-icons/fi';
import Modal from '../../components/Modal';
import toast from 'react-hot-toast';

const Users = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    phone: '',
    role: 'staff',
    is_active: true
  });

  // Fetch users
  const { data: usersData, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await api.get('/auth/users');
      return response.data;
    }
  });

  const users = usersData?.data || [];

  // Create/Update user mutation
  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (editingUser) {
        await api.put(`/auth/users/${editingUser.id}`, data);
      } else {
        await api.post('/auth/users', data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['users']);
      toast.success(editingUser ? 'Kullanıcı güncellendi' : 'Kullanıcı oluşturuldu');
      handleCloseModal();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Bir hata oluştu');
    }
  });

  // Delete user mutation
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await api.delete(`/auth/users/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['users']);
      toast.success('Kullanıcı silindi');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Kullanıcı silinemedi');
    }
  });

  // Toggle active status
  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, is_active }) => {
      await api.put(`/auth/users/${id}`, { is_active });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['users']);
      toast.success('Kullanıcı durumu güncellendi');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Durum güncellenemedi');
    }
  });

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      email: user.email,
      password: '', // Don't fill password for edit
      first_name: user.first_name,
      last_name: user.last_name,
      phone: user.phone || '',
      role: user.role,
      is_active: user.is_active
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingUser(null);
    setFormData({
      username: '',
      email: '',
      password: '',
      first_name: '',
      last_name: '',
      phone: '',
      role: 'staff',
      is_active: true
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate
    if (!formData.username || !formData.email || !formData.first_name || !formData.last_name) {
      toast.error('Kullanıcı adı, email, ad ve soyad zorunludur');
      return;
    }

    if (!editingUser && !formData.password) {
      toast.error('Yeni kullanıcı için şifre zorunludur');
      return;
    }

    // Prepare data
    const submitData = { ...formData };
    if (editingUser && !submitData.password) {
      delete submitData.password; // Don't send empty password for update
    }

    saveMutation.mutate(submitData);
  };

  const handleDelete = (user) => {
    if (window.confirm(`${user.first_name} ${user.last_name} kullanıcısını silmek istediğinizden emin misiniz?`)) {
      deleteMutation.mutate(user.id);
    }
  };

  const getRoleBadge = (role) => {
    const badges = {
      admin: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      manager: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      staff: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    };
    const labels = {
      admin: 'Admin',
      manager: 'Yönetici',
      staff: 'Personel'
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${badges[role] || badges.staff}`}>
        {labels[role] || role}
      </span>
    );
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">Yükleniyor...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Kullanıcı Yönetimi</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Sistem kullanıcılarını yönetin</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn btn-primary flex items-center gap-2">
          <FiPlus size={20} />
          Yeni Kullanıcı
        </button>
      </div>

      {/* Users Table */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Kullanıcı</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Rol</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Durum</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Oluşturulma</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {users.length > 0 ? (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                          <FiUser className="text-primary-600 dark:text-primary-400" size={20} />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {user.first_name} {user.last_name}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">@{user.username}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{user.email}</td>
                    <td className="px-6 py-4">{getRoleBadge(user.role)}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => toggleActiveMutation.mutate({ id: user.id, is_active: !user.is_active })}
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          user.is_active
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                        }`}
                      >
                        {user.is_active ? 'Aktif' : 'Pasif'}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                      {new Date(user.created_at).toLocaleDateString('tr-TR')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(user)}
                          className="text-blue-600 hover:text-blue-800 dark:hover:text-blue-400"
                          title="Düzenle"
                        >
                          <FiEdit2 size={18} />
                        </button>
                        {user.role !== 'admin' && (
                          <button
                            onClick={() => handleDelete(user)}
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
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                    Henüz kullanıcı bulunmuyor
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit User Modal */}
      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title={editingUser ? 'Kullanıcı Düzenle' : 'Yeni Kullanıcı'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Kullanıcı Adı *</label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              className="input"
              required
              minLength={3}
              disabled={editingUser} // Username cannot be changed
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Ad *</label>
              <input
                type="text"
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                className="input"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Soyad *</label>
              <input
                type="text"
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                className="input"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Email *</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="input"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Telefon</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Şifre {editingUser ? '(Boş bırakılırsa değişmez)' : '*'}
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="input"
              required={!editingUser}
              minLength={6}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Rol *</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="input"
              required
            >
              <option value="staff">Personel</option>
              <option value="manager">Yönetici</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="w-4 h-4"
            />
            <label htmlFor="is_active" className="text-sm font-medium">
              Aktif Kullanıcı
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <button type="submit" className="btn btn-primary" disabled={saveMutation.isLoading}>
              {saveMutation.isLoading ? 'Kaydediliyor...' : t('common.save')}
            </button>
            <button type="button" onClick={handleCloseModal} className="btn btn-secondary">
              {t('common.cancel')}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Users;

