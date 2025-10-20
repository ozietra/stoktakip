import React from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';

const ProductDetails = () => {
  const { id } = useParams();
  const { t } = useTranslation();

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const response = await api.get(`/products/${id}`);
      return response.data.data;
    }
  });

  if (isLoading) {
    return <div className="text-center py-8">{t('common.loading')}</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        {product?.name}
      </h1>
      
      <div className="card p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold mb-2">{t('product.sku')}</h3>
            <p className="text-gray-600 dark:text-gray-400">{product?.sku}</p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">{t('product.barcode')}</h3>
            <p className="text-gray-600 dark:text-gray-400">{product?.barcode || '-'}</p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">{t('product.costPrice')}</h3>
            <p className="text-gray-600 dark:text-gray-400">₺{product?.cost_price}</p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">{t('product.salePrice')}</h3>
            <p className="text-gray-600 dark:text-gray-400">₺{product?.sale_price}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;

