import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  FiHome, FiPackage, FiLayers, FiTruck, FiUsers, FiShoppingCart,
  FiShoppingBag, FiFileText, FiBarChart2, FiGift, FiX, FiGrid, FiTag,
  FiSettings, FiUserPlus
} from 'react-icons/fi';

const Sidebar = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const location = useLocation();

  const menuItems = [
    { path: '/', icon: FiHome, label: t('menu.dashboard') },
    { path: '/products', icon: FiPackage, label: t('menu.products') },
    { path: '/categories', icon: FiGrid, label: t('menu.categories') },
    { path: '/units', icon: FiTag, label: t('menu.units') },
    { path: '/stock/list', icon: FiLayers, label: 'Stok Listesi' },
    { path: '/stock/movements', icon: FiLayers, label: t('menu.stockMovements') },
    { path: '/warehouses', icon: FiTruck, label: t('menu.warehouses') },
    { path: '/suppliers', icon: FiUsers, label: t('menu.suppliers') },
    { path: '/customers', icon: FiUsers, label: t('menu.customers') },
    { path: '/purchases', icon: FiShoppingCart, label: t('menu.purchaseOrders') },
    { path: '/sales', icon: FiShoppingBag, label: t('menu.sales') },
    { path: '/campaigns', icon: FiGift, label: t('menu.campaigns') },
    { path: '/reports', icon: FiBarChart2, label: t('menu.reports') },
    { path: '/users', icon: FiUserPlus, label: 'Kullanıcılar' },
    { path: '/settings', icon: FiSettings, label: 'Ayarlar' }
  ];

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-75 z-20 lg:hidden"
          onClick={onClose}
        ></div>
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-30 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 dark:border-gray-700">
            <Link to="/" className="flex items-center space-x-2">
              <FiPackage className="text-2xl text-primary-600 dark:text-primary-500" />
              <span className="text-xl font-bold text-gray-800 dark:text-white">
                Stok Sistemi
              </span>
            </Link>
            <button
              onClick={onClose}
              className="lg:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <FiX className="text-xl" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto custom-scrollbar py-4">
            <ul className="space-y-1 px-3">
              {menuItems.map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors ${
                      isActive(item.path)
                        ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                    onClick={() => window.innerWidth < 1024 && onClose()}
                  >
                    <item.icon className="text-xl" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

