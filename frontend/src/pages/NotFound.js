import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FiHome } from 'react-icons/fi';

const NotFound = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-primary-600 dark:text-primary-500">404</h1>
        <p className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mt-4">
          Sayfa Bulunamadı
        </p>
        <p className="text-gray-600 dark:text-gray-400 mt-2 mb-8">
          Aradığınız sayfa mevcut değil veya taşınmış olabilir.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 btn btn-primary"
        >
          <FiHome />
          Ana Sayfaya Dön
        </Link>
      </div>
    </div>
  );
};

export default NotFound;

