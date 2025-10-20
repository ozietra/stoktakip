import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import toast from 'react-hot-toast';

const ProductForm = ({ product, onSuccess, onCancel }) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    sku: '',
    barcode: '',
    name: '',
    name_en: '',
    description: '',
    category_id: '',
    unit_id: '',
    cost_price: 0,
    sale_price: 0,
    tax_rate: 18,
    min_stock_level: 0,
    max_stock_level: 0,
    reorder_point: 0,
    reorder_quantity: 0,
    brand: '',
    model: '',
    is_active: true,
    is_trackable: true
  });

  // Fetch categories and units
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await api.get('/categories');
      return res.data.data;
    }
  });

  const { data: units } = useQuery({
    queryKey: ['units'],
    queryFn: async () => {
      const res = await api.get('/units');
      return res.data.data;
    }
  });

  useEffect(() => {
    if (product) {
      setFormData(product);
    }
  }, [product]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (product) {
        await api.put(`/products/${product.id}`, formData);
        toast.success(t('messages.updateSuccess'));
      } else {
        await api.post('/products', formData);
        toast.success(t('messages.saveSuccess'));
      }
      onSuccess();
    } catch (error) {
      toast.error(error.response?.data?.message || t('messages.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* SKU */}
        <div>
          <label className="block text-sm font-medium mb-1">
            {t('product.sku')} *
          </label>
          <input
            type="text"
            name="sku"
            value={formData.sku}
            onChange={handleChange}
            className="input"
            required
          />
        </div>

        {/* Barcode */}
        <div>
          <label className="block text-sm font-medium mb-1">
            {t('product.barcode')}
          </label>
          <input
            type="text"
            name="barcode"
            value={formData.barcode}
            onChange={handleChange}
            className="input"
          />
        </div>

        {/* Name TR */}
        <div>
          <label className="block text-sm font-medium mb-1">
            {t('product.name')} (TR) *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="input"
            required
          />
        </div>

        {/* Name EN */}
        <div>
          <label className="block text-sm font-medium mb-1">
            {t('product.name')} (EN)
          </label>
          <input
            type="text"
            name="name_en"
            value={formData.name_en}
            onChange={handleChange}
            className="input"
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium mb-1">
            {t('product.category')}
          </label>
          <select
            name="category_id"
            value={formData.category_id}
            onChange={handleChange}
            className="input"
          >
            <option value="">{t('common.selectAll')}</option>
            {categories?.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        {/* Unit */}
        <div>
          <label className="block text-sm font-medium mb-1">
            {t('product.unit')} *
          </label>
          <select
            name="unit_id"
            value={formData.unit_id}
            onChange={handleChange}
            className="input"
            required
          >
            <option value="">{t('common.selectAll')}</option>
            {units?.map(unit => (
              <option key={unit.id} value={unit.id}>{unit.name}</option>
            ))}
          </select>
        </div>

        {/* Cost Price */}
        <div>
          <label className="block text-sm font-medium mb-1">
            {t('product.costPrice')}
          </label>
          <input
            type="number"
            step="0.01"
            name="cost_price"
            value={formData.cost_price}
            onChange={handleChange}
            className="input"
          />
        </div>

        {/* Sale Price */}
        <div>
          <label className="block text-sm font-medium mb-1">
            {t('product.salePrice')}
          </label>
          <input
            type="number"
            step="0.01"
            name="sale_price"
            value={formData.sale_price}
            onChange={handleChange}
            className="input"
          />
        </div>

        {/* Tax Rate */}
        <div>
          <label className="block text-sm font-medium mb-1">
            {t('product.taxRate')} (%)
          </label>
          <input
            type="number"
            step="0.01"
            name="tax_rate"
            value={formData.tax_rate}
            onChange={handleChange}
            className="input"
          />
        </div>

        {/* Min Stock */}
        <div>
          <label className="block text-sm font-medium mb-1">
            {t('product.minStock')}
          </label>
          <input
            type="number"
            step="0.01"
            name="min_stock_level"
            value={formData.min_stock_level}
            onChange={handleChange}
            className="input"
          />
        </div>

        {/* Max Stock */}
        <div>
          <label className="block text-sm font-medium mb-1">
            {t('product.maxStock')}
          </label>
          <input
            type="number"
            step="0.01"
            name="max_stock_level"
            value={formData.max_stock_level}
            onChange={handleChange}
            className="input"
          />
        </div>

        {/* Brand */}
        <div>
          <label className="block text-sm font-medium mb-1">
            {t('product.brand')}
          </label>
          <input
            type="text"
            name="brand"
            value={formData.brand}
            onChange={handleChange}
            className="input"
          />
        </div>

        {/* Model */}
        <div>
          <label className="block text-sm font-medium mb-1">
            {t('product.model')}
          </label>
          <input
            type="text"
            name="model"
            value={formData.model}
            onChange={handleChange}
            className="input"
          />
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium mb-1">
          {t('product.description')}
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          className="input"
          rows="3"
        />
      </div>

      {/* Checkboxes */}
      <div className="flex items-center gap-6">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            name="is_active"
            checked={formData.is_active}
            onChange={handleChange}
            className="rounded"
          />
          <span>{t('common.active')}</span>
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            name="is_trackable"
            checked={formData.is_trackable}
            onChange={handleChange}
            className="rounded"
          />
          <span>{t('product.trackable')}</span>
        </label>
      </div>

      {/* Buttons */}
      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary"
        >
          {loading ? t('common.loading') : t('common.save')}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="btn btn-secondary"
        >
          {t('common.cancel')}
        </button>
      </div>
    </form>
  );
};

export default ProductForm;

