import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import { FiSave, FiUser, FiLock, FiGlobe, FiBell, FiAlertTriangle, FiTrash2 } from 'react-icons/fi';
import toast from 'react-hot-toast';

const Settings = () => {
  const { i18n } = useTranslation();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('profile');

  // Get current user
  const { data: userData } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const response = await api.get('/auth/me');
      return response.data.data;
    }
  });

  const user = userData || {};

  // Profile form
  const [profileData, setProfileData] = useState({
    name: user.name || '',
    email: user.email || ''
  });

  // Password form
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data) => {
      await api.put('/auth/profile', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['currentUser']);
      toast.success('Profil güncellendi');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Profil güncellenemedi');
    }
  });

  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: async (data) => {
      await api.post('/auth/change-password', data);
    },
    onSuccess: () => {
      toast.success('Şifre değiştirildi');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Şifre değiştirilemedi');
    }
  });

  // Reset database mutation
  const resetDatabaseMutation = useMutation({
    mutationFn: async () => {
      await api.post('/system/reset-database');
    },
    onSuccess: () => {
      toast.success('Veritabanı fabrika ayarlarına sıfırlandı. Yönlendiriliyorsunuz...');
      setTimeout(() => {
        localStorage.clear();
        window.location.href = '/login';
      }, 2000);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Veritabanı sıfırlanamadı');
    }
  });

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    updateProfileMutation.mutate(profileData);
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Yeni şifreler eşleşmiyor');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('Şifre en az 6 karakter olmalıdır');
      return;
    }

    changePasswordMutation.mutate({
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword
    });
  };

  const handleLanguageChange = (lang) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('language', lang);
    toast.success('Dil değiştirildi');
  };

  const handleResetDatabase = () => {
    // Onay dialogu
    const isConfirmed = window.confirm(
      '⚠️ TEHLİKE! Bu işlem geri alınamaz!\n\n' +
      'Tüm veriler silinecek ve sistem fabrika ayarlarına dönecektir.\n' +
      'Admin kullanıcısı: admin@stok.com / admin123 olacaktır.\n\n' +
      'Devam etmek istediğinizden emin misiniz?'
    );

    if (isConfirmed) {
      const doubleConfirm = window.confirm(
        'SON UYARI!\n\n' +
        'Bu işlem:\n' +
        '• Tüm ürünleri silecek\n' +
        '• Tüm satışları silecek\n' +
        '• Tüm müşterileri silecek\n' +
        '• Tüm stok hareketlerini silecek\n' +
        '• Admin dışındaki tüm kullanıcıları silecek\n\n' +
        'GERÇEKTEN devam etmek istiyor musunuz?'
      );

      if (doubleConfirm) {
        resetDatabaseMutation.mutate();
      }
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profil', icon: FiUser },
    { id: 'password', label: 'Şifre', icon: FiLock },
    { id: 'preferences', label: 'Tercihler', icon: FiGlobe },
    { id: 'notifications', label: 'Bildirimler', icon: FiBell }
  ];

  // Admin için tehlikeli işlemler sekmesi ekle
  if (user.role === 'admin') {
    tabs.push({ id: 'danger', label: 'Tehlikeli İşlemler', icon: FiAlertTriangle });
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Ayarlar</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Hesap ve sistem ayarlarınızı yönetin</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 font-medium transition-colors ${
              activeTab === tab.id
                ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <tab.icon size={18} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="card">
        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <form onSubmit={handleProfileSubmit} className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Profil Bilgileri</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">İsim</label>
                  <input
                    type="text"
                    value={profileData.name}
                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                    className="input"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                    className="input"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Rol</label>
                  <input
                    type="text"
                    value={user.role === 'admin' ? 'Admin' : user.role === 'manager' ? 'Yönetici' : 'Personel'}
                    className="input bg-gray-100 dark:bg-gray-700"
                    disabled
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary flex items-center gap-2"
              disabled={updateProfileMutation.isLoading}
            >
              <FiSave size={18} />
              {updateProfileMutation.isLoading ? 'Kaydediliyor...' : 'Kaydet'}
            </button>
          </form>
        )}

        {/* Password Tab */}
        {activeTab === 'password' && (
          <form onSubmit={handlePasswordSubmit} className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Şifre Değiştir</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Mevcut Şifre</label>
                  <input
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    className="input"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Yeni Şifre</label>
                  <input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    className="input"
                    required
                    minLength={6}
                  />
                  <p className="text-sm text-gray-500 mt-1">En az 6 karakter</p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Yeni Şifre (Tekrar)</label>
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    className="input"
                    required
                    minLength={6}
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary flex items-center gap-2"
              disabled={changePasswordMutation.isLoading}
            >
              <FiLock size={18} />
              {changePasswordMutation.isLoading ? 'Değiştiriliyor...' : 'Şifreyi Değiştir'}
            </button>
          </form>
        )}

        {/* Preferences Tab */}
        {activeTab === 'preferences' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Dil Seçimi</h3>
              <div className="flex gap-3">
                <button
                  onClick={() => handleLanguageChange('tr')}
                  className={`px-4 py-2 rounded-lg font-medium ${
                    i18n.language === 'tr'
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  🇹🇷 Türkçe
                </button>
                <button
                  onClick={() => handleLanguageChange('en')}
                  className={`px-4 py-2 rounded-lg font-medium ${
                    i18n.language === 'en'
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  🇬🇧 English
                </button>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Tema</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Tema ayarı sağ üst köşedeki ay/güneş simgesinden yapılabilir.
              </p>
            </div>
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Bildirim Tercihleri</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                  <div>
                    <p className="font-medium">Düşük Stok Uyarıları</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Stok seviyesi minimuma düştüğünde bildirim al</p>
                  </div>
                  <input type="checkbox" defaultChecked className="w-5 h-5" />
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                  <div>
                    <p className="font-medium">Yeni Siparişler</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Yeni sipariş oluşturulduğunda bildirim al</p>
                  </div>
                  <input type="checkbox" defaultChecked className="w-5 h-5" />
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                  <div>
                    <p className="font-medium">Günlük Raporlar</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Günlük satış raporlarını email olarak al</p>
                  </div>
                  <input type="checkbox" className="w-5 h-5" />
                </div>
              </div>
            </div>

            <button className="btn btn-primary flex items-center gap-2">
              <FiSave size={18} />
              Tercihleri Kaydet
            </button>
          </div>
        )}

        {/* Danger Zone Tab (Admin Only) */}
        {activeTab === 'danger' && user.role === 'admin' && (
          <div className="space-y-6">
            <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-lg p-6">
              <div className="flex items-start gap-4">
                <FiAlertTriangle className="text-red-600 dark:text-red-400 flex-shrink-0 mt-1" size={24} />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-red-900 dark:text-red-200 mb-2">
                    Tehlikeli Bölge
                  </h3>
                  <p className="text-red-700 dark:text-red-300 mb-4">
                    Bu bölümdeki işlemler geri alınamaz ve sisteminizi kalıcı olarak etkileyebilir.
                    Lütfen dikkatli olun.
                  </p>
                </div>
              </div>
            </div>

            <div className="border-2 border-red-300 dark:border-red-700 rounded-lg p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Veritabanını Fabrika Ayarlarına Sıfırla
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400 mb-2">
                    Bu işlem tüm verileri kalıcı olarak siler ve sistemi ilk kurulum haline getirir.
                  </p>
                  <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 mb-4">
                    <li>• Tüm ürünler silinecek</li>
                    <li>• Tüm satışlar ve siparişler silinecek</li>
                    <li>• Tüm müşteriler ve tedarikçiler silinecek</li>
                    <li>• Tüm stok hareketleri silinecek</li>
                    <li>• Admin dışındaki tüm kullanıcılar silinecek</li>
                    <li>• Admin: admin@stok.com / admin123 olacak</li>
                  </ul>
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                    <p className="text-sm text-yellow-800 dark:text-yellow-200 font-medium">
                      ⚠️ Bu işlem GERİ ALINAMAZ! Devam etmeden önce veri yedeklemeniz önerilir.
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleResetDatabase}
                  disabled={resetDatabaseMutation.isLoading}
                  className="flex-shrink-0 flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-semibold rounded-lg transition-colors"
                >
                  <FiTrash2 size={18} />
                  {resetDatabaseMutation.isLoading ? 'Sıfırlanıyor...' : 'Sıfırla'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;

