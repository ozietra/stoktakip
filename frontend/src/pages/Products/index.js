import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import { FiPlus, FiEdit, FiTrash2, FiEye, FiSearch } from 'react-icons/fi';
import Modal from '../../components/Modal';
import ProductForm from './ProductForm';
import Pagination from '../../components/Pagination';
import toast from 'react-hot-toast';

const Products = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['products', { page, search }],
    queryFn: async () => {
      const response = await api.get('/products', {
        params: { page, search, size: 20 }
      });
      return response.data.data;
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await api.delete(`/products/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['products']);
      toast.success(t('messages.deleteSuccess'));
    },
    onError: () => {
      toast.error(t('messages.error'));
    }
  });

  const handleDelete = (product) => {
    if (window.confirm(`${t('messages.confirmDelete')}\n\n${product.name} ürünü silinecek!`)) {
      deleteMutation.mutate(product.id);
    }
  };

  const handleEdit = (product) => {
    setSelectedProduct(product);
    setShowModal(true);
  };

  const handleAdd = () => {
    setSelectedProduct(null);
    setShowModal(true);
  };

  const handleSuccess = () => {
    setShowModal(false);
    setSelectedProduct(null);
    queryClient.invalidateQueries(['products']);
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t('product.title')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Tüm ürünleri görüntüleyin ve yönetin
          </p>
        </div>
        <button onClick={handleAdd} className="btn btn-primary flex items-center gap-2">
          <FiPlus />
          {t('product.addProduct')}
        </button>
      </div>

      {/* Search */}
      <div className="card p-4 mb-6">
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder={t('common.search')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-10"
          />
        </div>
      </div>

      {/* Products Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  {t('product.sku')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  {t('product.name')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  {t('product.category')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  {t('product.salePrice')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  {t('common.status')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  {t('common.actions')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {isLoading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center">
                    {t('common.loading')}
                  </td>
                </tr>
              ) : data?.items?.length > 0 ? (
                data.items.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {product.sku}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {product.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {product.category?.name || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      ₺{parseFloat(product.sale_price).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`badge ${product.is_active ? 'badge-success' : 'badge-gray'}`}>
                        {product.is_active ? t('common.active') : t('common.inactive')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center gap-3">
                        <Link
                          to={`/products/${product.id}`}
                          className="text-blue-600 hover:text-blue-900"
                          title={t('common.details')}
                        >
                          <FiEye className="text-lg" />
                        </Link>
                        <button
                          onClick={() => handleEdit(product)}
                          className="text-green-600 hover:text-green-900"
                          title={t('common.edit')}
                        >
                          <FiEdit className="text-lg" />
                        </button>
                        <button
                          onClick={() => handleDelete(product)}
                          className="text-red-600 hover:text-red-900"
                          title={t('common.delete')}
                        >
                          <FiTrash2 className="text-lg" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center">
                    {t('messages.noData')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {data && data.totalPages > 1 && (
          <Pagination
            currentPage={data.currentPage}
            totalPages={data.totalPages}
            totalItems={data.totalItems}
            pageSize={data.pageSize}
            onPageChange={setPage}
          />
        )}
      </div>

      {/* Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={selectedProduct ? t('product.editProduct') : t('product.addProduct')}
        size="lg"
      >
        <ProductForm
          product={selectedProduct}
          onSuccess={handleSuccess}
          onCancel={() => setShowModal(false)}
        />
      </Modal>
    </div>
  );
};

export default Products;
