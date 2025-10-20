const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { PurchaseOrder, PurchaseOrderItem, Supplier, Warehouse, Product } = require('../models');
const { getPagination, getPagingData } = require('../utils/pagination');
const { Op } = require('sequelize');

// Get all purchase orders
router.get('/', protect, async (req, res, next) => {
  try {
    const { page, size, status, supplier_id } = req.query;
    const { limit, offset } = getPagination(page, size);

    const where = {};
    if (status) where.status = status;
    if (supplier_id) where.supplier_id = supplier_id;

    const data = await PurchaseOrder.findAndCountAll({
      where,
      limit,
      offset,
      order: [['createdAt', 'DESC']],
      include: [
        { model: Supplier, as: 'supplier', attributes: ['id', 'name', 'code'] },
        { model: Warehouse, as: 'warehouse', attributes: ['id', 'name', 'code'] }
      ],
      distinct: true
    });

    const response = getPagingData(data, page, limit);
    res.json({ success: true, data: response });
  } catch (error) {
    next(error);
  }
});

// Get purchase order by ID
router.get('/:id', protect, async (req, res, next) => {
  try {
    const order = await PurchaseOrder.findByPk(req.params.id, {
      include: [
        { model: Supplier, as: 'supplier' },
        { model: Warehouse, as: 'warehouse' },
        { model: PurchaseOrderItem, as: 'items', include: [{ model: Product, as: 'product' }] }
      ]
    });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Sipariş bulunamadı' });
    }

    res.json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
});

// Create purchase order
router.post('/', protect, authorize('admin', 'manager'), async (req, res, next) => {
  const transaction = await require('../config/database').sequelize.transaction();
  
  try {
    const { items, ...orderInfo } = req.body;

    const orderData = {
      ...orderInfo,
      created_by: req.user.id
    };
    
    // Create order
    const order = await PurchaseOrder.create(orderData, { transaction });

    // Create order items
    if (items && items.length > 0) {
      const orderItems = items.map(item => ({
        purchase_order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        discount_rate: item.discount_percentage || 0, // discount_rate in DB
        tax_rate: item.tax_rate || 0,
        total_price: item.total_price
      }));

      await PurchaseOrderItem.bulkCreate(orderItems, { transaction });
    }

    await transaction.commit();
    
    res.status(201).json({ success: true, message: 'Satın alma siparişi oluşturuldu', data: order });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
});

// Update purchase order
router.put('/:id', protect, authorize('admin', 'manager'), async (req, res, next) => {
  try {
    const order = await PurchaseOrder.findByPk(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Sipariş bulunamadı' });
    }
    await order.update(req.body);
    res.json({ success: true, message: 'Sipariş güncellendi', data: order });
  } catch (error) {
    next(error);
  }
});

// Delete purchase order
router.delete('/:id', protect, authorize('admin', 'manager'), async (req, res, next) => {
  try {
    const order = await PurchaseOrder.findByPk(req.params.id, {
      include: [{ model: PurchaseOrderItem, as: 'items' }]
    });
    
    if (!order) {
      return res.status(404).json({ success: false, message: 'Sipariş bulunamadı' });
    }

    // Check if order can be deleted (only draft or cancelled orders)
    if (!['draft', 'cancelled'].includes(order.status)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Sadece taslak veya iptal edilmiş siparişler silinebilir. Diğer siparişler için durumu "İptal Edildi" olarak değiştirin.' 
      });
    }

    // Delete order items first
    if (order.items && order.items.length > 0) {
      await PurchaseOrderItem.destroy({ where: { purchase_order_id: order.id } });
    }

    // Delete the order
    await order.destroy();
    
    res.json({ success: true, message: 'Sipariş silindi' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

