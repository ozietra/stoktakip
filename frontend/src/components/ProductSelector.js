import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import { FiPlus, FiTrash2, FiSearch } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';

const ProductSelector = ({ items = [], onChange }) => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');

  const { data: productsData } = useQuery({
    queryKey: ['products-all'],
    queryFn: async () => {
      const res = await api.get('/products', { params: { page: 1, size: 1000 } });
      return res.data.data;
    }
  });

  const products = productsData?.items || [];
  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.sku?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addItem = () => {
    onChange([...items, { 
      product_id: '', 
      quantity: 1, 
      unit_price: 0, 
      discount: 0,
      tax_rate: 0
    }]);
  };

  const removeItem = (index) => {
    onChange(items.filter((_, i) => i !== index));
  };

  const updateItem = (index, field, value) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    
    // Auto-calculate price when product is selected
    if (field === 'product_id' && value) {
      const product = products.find(p => p.id === parseInt(value));
      if (product) {
        newItems[index].unit_price = product.sell_price || 0;
      }
    }
    
    onChange(newItems);
  };

  const calculateItemTotal = (item) => {
    const subtotal = item.quantity * item.unit_price;
    const afterDiscount = subtotal - (subtotal * (item.discount || 0) / 100);
    const total = afterDiscount + (afterDiscount * (item.tax_rate || 0) / 100);
    return total;
  };

  const calculateGrandTotal = () => {
    return items.reduce((sum, item) => sum + calculateItemTotal(item), 0);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Ürünler</h3>
        <button
          type="button"
          onClick={addItem}
          className="btn btn-sm btn-primary flex items-center gap-1"
        >
          <FiPlus /> Ürün Ekle
        </button>
      </div>

      {items.length > 0 ? (
        <div className="space-y-3">
          {items.map((item, index) => (
            <div key={index} className="p-4 border dark:border-gray-700 rounded-lg space-y-3">
              <div className="grid grid-cols-12 gap-3">
                {/* Product Select */}
                <div className="col-span-5">
                  <label className="block text-xs font-medium mb-1">Ürün *</label>
                  <select
                    value={item.product_id}
                    onChange={(e) => updateItem(index, 'product_id', e.target.value)}
                    className="input input-sm"
                    required
                  >
                    <option value="">Ürün Seçin</option>
                    {products.map(product => (
                      <option key={product.id} value={product.id}>
                        {product.name} {product.sku ? `(${product.sku})` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Quantity */}
                <div className="col-span-2">
                  <label className="block text-xs font-medium mb-1">Miktar *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={item.quantity}
                    onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                    className="input input-sm"
                    required
                  />
                </div>

                {/* Unit Price */}
                <div className="col-span-2">
                  <label className="block text-xs font-medium mb-1">Birim Fiyat *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={item.unit_price}
                    onChange={(e) => updateItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                    className="input input-sm"
                    required
                  />
                </div>

                {/* Discount % */}
                <div className="col-span-2">
                  <label className="block text-xs font-medium mb-1">İndirim %</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={item.discount || 0}
                    onChange={(e) => updateItem(index, 'discount', parseFloat(e.target.value) || 0)}
                    className="input input-sm"
                  />
                </div>

                {/* Delete Button */}
                <div className="col-span-1 flex items-end">
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="btn btn-sm btn-danger w-full"
                    title="Sil"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              </div>

              {/* Item Total */}
              <div className="flex justify-end">
                <div className="text-right">
                  <span className="text-xs text-gray-500 dark:text-gray-400">Satır Toplamı: </span>
                  <span className="font-semibold">₺{calculateItemTotal(item).toFixed(2)}</span>
                </div>
              </div>
            </div>
          ))}

          {/* Grand Total */}
          <div className="p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="font-semibold">Genel Toplam:</span>
              <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                ₺{calculateGrandTotal().toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 border-2 border-dashed dark:border-gray-700 rounded-lg">
          <p className="text-gray-500 dark:text-gray-400 mb-3">Henüz ürün eklenmedi</p>
          <button
            type="button"
            onClick={addItem}
            className="btn btn-primary flex items-center gap-2 mx-auto"
          >
            <FiPlus /> İlk Ürünü Ekle
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductSelector;

