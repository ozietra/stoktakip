const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { Sale, SaleItem, Customer, Warehouse, Product, StockMovement } = require('../models');
const { getPagination, getPagingData } = require('../utils/pagination');
const { Op } = require('sequelize');
const stockHelper = require('../utils/stockHelper');
const notificationHelper = require('../utils/notificationHelper');

// Get all sales
router.get('/', protect, async (req, res, next) => {
  try {
    const { page, size, status, customer_id, start_date, end_date } = req.query;
    const { limit, offset } = getPagination(page, size);

    const where = {};
    if (status) where.status = status;
    if (customer_id) where.customer_id = customer_id;
    if (start_date && end_date) {
      where.sale_date = { [Op.between]: [new Date(start_date), new Date(end_date)] };
    }

    const data = await Sale.findAndCountAll({
      where,
      limit,
      offset,
      order: [['sale_date', 'DESC']],
      include: [
        { model: Customer, as: 'customer', attributes: ['id', 'name', 'code'] },
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

// Get sale by ID
router.get('/:id', protect, async (req, res, next) => {
  try {
    const sale = await Sale.findByPk(req.params.id, {
      include: [
        { model: Customer, as: 'customer' },
        { model: Warehouse, as: 'warehouse' },
        { model: SaleItem, as: 'items', include: [{ model: Product, as: 'product' }] }
      ]
    });

    if (!sale) {
      return res.status(404).json({ success: false, message: 'Satış bulunamadı' });
    }

    res.json({ success: true, data: sale });
  } catch (error) {
    next(error);
  }
});

// Create sale
router.post('/', protect, authorize('admin', 'manager', 'staff'), async (req, res, next) => {
  const transaction = await require('../config/database').sequelize.transaction();
  
  try {
    const { items, ...saleInfo } = req.body;

    console.log('📦 Sale creation request:', { items, saleInfo });

    // Handle empty customer_id (convert empty string to null)
    const saleData = {
      ...saleInfo,
      customer_id: saleInfo.customer_id || null,
      created_by: req.user.id
    };
    
    console.log('💾 Creating sale with data:', saleData);
    
    // Create sale
    const sale = await Sale.create(saleData, { transaction });
    
    console.log('✅ Sale created:', sale.id);

    // Create sale items and update stock
    if (items && items.length > 0) {
      const saleItems = items.map(item => ({
        sale_id: sale.id,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        discount_rate: item.discount_percentage || 0, // discount_rate in DB
        tax_rate: item.tax_rate || 0,
        total_price: item.total_price
      }));

      console.log('📝 Creating sale items:', saleItems);

      await SaleItem.bulkCreate(saleItems, { transaction });

      console.log('✅ Sale items created');

      // Create stock movements and update stock for each item
      for (const item of items) {
        console.log(`📦 Processing stock for product ${item.product_id}, quantity: ${item.quantity}`);

        // Create stock movement record
        await StockMovement.create({
          product_id: item.product_id,
          warehouse_id: saleData.warehouse_id,
          type: 'out',
          quantity: item.quantity,
          unit_price: item.unit_price,
          total_price: item.total_price,
          reference_type: 'sale',
          reference_id: sale.id,
          reference_number: sale.sale_number,
          movement_date: sale.sale_date,
          created_by: req.user.id,
          notes: `Satış: ${sale.sale_number}`
        }, { transaction });

        console.log(`✅ Stock movement created for product ${item.product_id}`);

        // Update stock quantity
        await stockHelper.updateStock(
          item.product_id,
          saleData.warehouse_id,
          null, // location_id
          item.quantity,
          'out',
          transaction
        );

        console.log(`✅ Stock updated for product ${item.product_id}`);

        // Check if stock is below minimum level and create notification
        const isBelowMin = await stockHelper.checkMinimumStock(item.product_id);
        if (isBelowMin) {
          console.log(`⚠️ Warning: Product ${item.product_id} is below minimum stock level`);
          // Create low stock notification (async, doesn't block the transaction)
          notificationHelper.createLowStockNotification(item.product_id).catch(err => {
            console.error(`Error creating notification for product ${item.product_id}:`, err);
          });
        }
      }
    }

    await transaction.commit();
    
    console.log('✅ Transaction committed');
    
    res.status(201).json({ success: true, message: 'Satış kaydedildi', data: sale });
  } catch (error) {
    console.error('❌ Sale creation error:', error.message);
    console.error('❌ Error details:', error);
    await transaction.rollback();
    next(error);
  }
});

// Update sale
router.put('/:id', protect, authorize('admin', 'manager'), async (req, res, next) => {
  try {
    const sale = await Sale.findByPk(req.params.id);
    if (!sale) {
      return res.status(404).json({ success: false, message: 'Satış bulunamadı' });
    }
    await sale.update(req.body);
    res.json({ success: true, message: 'Satış güncellendi', data: sale });
  } catch (error) {
    next(error);
  }
});

// Delete sale
router.delete('/:id', protect, authorize('admin', 'manager'), async (req, res, next) => {
  const transaction = await require('../config/database').sequelize.transaction();

  try {
    const sale = await Sale.findByPk(req.params.id, {
      include: [{ model: SaleItem, as: 'items' }]
    });

    if (!sale) {
      await transaction.rollback();
      return res.status(404).json({ success: false, message: 'Satış bulunamadı' });
    }

    // Check if sale can be deleted (only pending or cancelled sales)
    if (!['pending', 'cancelled'].includes(sale.status)) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Sadece beklemedeki veya iptal edilmiş satışlar silinebilir. Diğer satışlar için durumu "İptal Edildi" olarak değiştirin.'
      });
    }

    // Return stock for each item
    if (sale.items && sale.items.length > 0) {
      for (const item of sale.items) {
        // Create return stock movement
        await StockMovement.create({
          product_id: item.product_id,
          warehouse_id: sale.warehouse_id,
          type: 'return',
          quantity: item.quantity,
          unit_price: item.unit_price,
          total_price: item.total_price,
          reference_type: 'sale',
          reference_id: sale.id,
          reference_number: sale.sale_number,
          movement_date: new Date(),
          created_by: req.user.id,
          notes: `Satış iptali: ${sale.sale_number}`
        }, { transaction });

        // Update stock - add back the quantity
        await stockHelper.updateStock(
          item.product_id,
          sale.warehouse_id,
          null,
          item.quantity,
          'return',
          transaction
        );
      }

      // Delete sale items
      await SaleItem.destroy({ where: { sale_id: sale.id } }, { transaction });
    }

    // Delete related stock movements
    await StockMovement.destroy({
      where: {
        reference_type: 'sale',
        reference_id: sale.id
      }
    }, { transaction });

    // Delete the sale
    await sale.destroy({ transaction });

    await transaction.commit();
    res.json({ success: true, message: 'Satış silindi ve stok geri eklendi' });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
});

module.exports = router;

