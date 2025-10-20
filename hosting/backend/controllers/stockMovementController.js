const { StockMovement, Product, Warehouse, Location, User, Stock } = require('../models');
const { sequelize } = require('../config/database');
const { Op } = require('sequelize');
const { getPagination, getPagingData } = require('../utils/pagination');
const { updateStock } = require('../utils/stockHelper');

// Get all stock movements
exports.getAllMovements = async (req, res, next) => {
  try {
    const { page, size, type, product_id, warehouse_id, start_date, end_date, search } = req.query;
    const { limit, offset } = getPagination(page, size);

    const where = {};
    
    if (type) where.type = type;
    if (product_id) where.product_id = product_id;
    if (warehouse_id) where.warehouse_id = warehouse_id;
    if (search) where.reference_number = { [Op.like]: `%${search}%` };
    
    if (start_date && end_date) {
      where.movement_date = {
        [Op.between]: [new Date(start_date), new Date(end_date)]
      };
    }

    const data = await StockMovement.findAndCountAll({
      where,
      limit,
      offset,
      order: [['movement_date', 'DESC']],
      include: [
        { model: Product, as: 'product', attributes: ['id', 'name', 'sku', 'barcode'] },
        { model: Warehouse, as: 'warehouse', attributes: ['id', 'name', 'code'] },
        { model: Location, as: 'location', attributes: ['id', 'name', 'code'] },
        { model: User, as: 'creator', attributes: ['id', 'first_name', 'last_name'] },
        { model: Warehouse, as: 'fromWarehouse', attributes: ['id', 'name', 'code'] },
        { model: Warehouse, as: 'toWarehouse', attributes: ['id', 'name', 'code'] }
      ],
      distinct: true
    });

    const response = getPagingData(data, page, limit);

    res.json({
      success: true,
      data: response
    });
  } catch (error) {
    next(error);
  }
};

// Get movement by ID
exports.getMovementById = async (req, res, next) => {
  try {
    const movement = await StockMovement.findByPk(req.params.id, {
      include: [
        { model: Product, as: 'product' },
        { model: Warehouse, as: 'warehouse' },
        { model: Location, as: 'location' },
        { model: User, as: 'creator' },
        { model: Warehouse, as: 'fromWarehouse' },
        { model: Warehouse, as: 'toWarehouse' }
      ]
    });

    if (!movement) {
      return res.status(404).json({
        success: false,
        message: 'Hareket kaydı bulunamadı'
      });
    }

    res.json({
      success: true,
      data: movement
    });
  } catch (error) {
    next(error);
  }
};

// Create stock movement (IN)
exports.createStockIn = async (req, res, next) => {
  const t = await sequelize.transaction();
  
  try {
    const { product_id, warehouse_id, location_id, quantity, unit_price, reference_type, reference_number, batch_number, serial_number, expiry_date, notes } = req.body;

    // Validate product exists
    const product = await Product.findByPk(product_id);
    if (!product) {
      await t.rollback();
      return res.status(404).json({
        success: false,
        message: 'Ürün bulunamadı'
      });
    }

    // Validate warehouse exists
    const warehouse = await Warehouse.findByPk(warehouse_id);
    if (!warehouse) {
      await t.rollback();
      return res.status(404).json({
        success: false,
        message: 'Depo bulunamadı'
      });
    }

    // Create movement
    const movement = await StockMovement.create({
      product_id,
      warehouse_id,
      location_id,
      type: 'in',
      quantity,
      unit_price: unit_price || 0,
      total_price: quantity * (unit_price || 0),
      reference_type,
      reference_number,
      batch_number,
      serial_number,
      expiry_date,
      notes,
      created_by: req.user.id,
      movement_date: new Date()
    }, { transaction: t });

    // Update stock
    await updateStock(product_id, warehouse_id, location_id, quantity, 'in', t);

    await t.commit();

    res.status(201).json({
      success: true,
      message: 'Stok girişi başarıyla kaydedildi',
      data: movement
    });
  } catch (error) {
    await t.rollback();
    next(error);
  }
};

// Create stock movement (OUT)
exports.createStockOut = async (req, res, next) => {
  const t = await sequelize.transaction();
  
  try {
    const { product_id, warehouse_id, location_id, quantity, reference_type, reference_number, notes } = req.body;

    // Validate product exists
    const product = await Product.findByPk(product_id);
    if (!product) {
      await t.rollback();
      return res.status(404).json({
        success: false,
        message: 'Ürün bulunamadı'
      });
    }

    // Check available stock
    const stock = await Stock.findOne({
      where: {
        product_id,
        warehouse_id,
        location_id: location_id || null
      }
    });

    if (!stock || stock.available_quantity < quantity) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: 'Yetersiz stok'
      });
    }

    // Create movement
    const movement = await StockMovement.create({
      product_id,
      warehouse_id,
      location_id,
      type: 'out',
      quantity,
      unit_price: stock.average_cost || 0,
      total_price: quantity * (stock.average_cost || 0),
      reference_type,
      reference_number,
      notes,
      created_by: req.user.id,
      movement_date: new Date()
    }, { transaction: t });

    // Update stock
    await updateStock(product_id, warehouse_id, location_id, quantity, 'out', t);

    await t.commit();

    res.status(201).json({
      success: true,
      message: 'Stok çıkışı başarıyla kaydedildi',
      data: movement
    });
  } catch (error) {
    await t.rollback();
    next(error);
  }
};

// Create stock transfer
exports.createStockTransfer = async (req, res, next) => {
  const t = await sequelize.transaction();
  
  try {
    const { product_id, from_warehouse_id, to_warehouse_id, from_location_id, to_location_id, quantity, notes } = req.body;

    // Validate warehouses are different
    if (from_warehouse_id === to_warehouse_id) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: 'Kaynak ve hedef depo aynı olamaz'
      });
    }

    // Check available stock in source warehouse
    const stock = await Stock.findOne({
      where: {
        product_id,
        warehouse_id: from_warehouse_id,
        location_id: from_location_id || null
      }
    });

    if (!stock || stock.available_quantity < quantity) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: 'Yetersiz stok'
      });
    }

    // Create OUT movement from source
    await StockMovement.create({
      product_id,
      warehouse_id: from_warehouse_id,
      location_id: from_location_id,
      type: 'transfer',
      quantity,
      unit_price: stock.average_cost || 0,
      total_price: quantity * (stock.average_cost || 0),
      from_warehouse_id,
      to_warehouse_id,
      reference_type: 'transfer',
      notes,
      created_by: req.user.id,
      movement_date: new Date()
    }, { transaction: t });

    // Create IN movement to destination
    const movement = await StockMovement.create({
      product_id,
      warehouse_id: to_warehouse_id,
      location_id: to_location_id,
      type: 'transfer',
      quantity,
      unit_price: stock.average_cost || 0,
      total_price: quantity * (stock.average_cost || 0),
      from_warehouse_id,
      to_warehouse_id,
      reference_type: 'transfer',
      notes,
      created_by: req.user.id,
      movement_date: new Date()
    }, { transaction: t });

    // Update stock in source warehouse (OUT)
    await updateStock(product_id, from_warehouse_id, from_location_id, quantity, 'out', t);

    // Update stock in destination warehouse (IN)
    await updateStock(product_id, to_warehouse_id, to_location_id, quantity, 'in', t);

    await t.commit();

    res.status(201).json({
      success: true,
      message: 'Transfer işlemi başarıyla tamamlandı',
      data: movement
    });
  } catch (error) {
    await t.rollback();
    next(error);
  }
};

// Adjust stock
exports.adjustStock = async (req, res, next) => {
  const t = await sequelize.transaction();
  
  try {
    const { product_id, warehouse_id, location_id, new_quantity, reason, notes } = req.body;

    // Get current stock
    const stock = await Stock.findOne({
      where: {
        product_id,
        warehouse_id,
        location_id: location_id || null
      }
    });

    const currentQuantity = stock ? stock.quantity : 0;
    const difference = new_quantity - currentQuantity;

    // Create adjustment movement
    const movement = await StockMovement.create({
      product_id,
      warehouse_id,
      location_id,
      type: 'adjustment',
      quantity: new_quantity,
      reference_type: 'manual',
      notes: `${reason || 'Stok Düzeltmesi'} - ${notes || ''}`,
      created_by: req.user.id,
      movement_date: new Date()
    }, { transaction: t });

    // Update stock with new quantity (adjustment sets exact value)
    await updateStock(product_id, warehouse_id, location_id, new_quantity, 'adjustment', t);

    await t.commit();

    res.status(201).json({
      success: true,
      message: 'Stok düzeltmesi yapıldı',
      data: {
        movement,
        old_quantity: currentQuantity,
        new_quantity,
        difference
      }
    });
  } catch (error) {
    await t.rollback();
    next(error);
  }
};

// Get product movement history
exports.getProductMovements = async (req, res, next) => {
  try {
    const { page, size } = req.query;
    const { limit, offset } = getPagination(page, size);

    const data = await StockMovement.findAndCountAll({
      where: { product_id: req.params.productId },
      limit,
      offset,
      order: [['movement_date', 'DESC']],
      include: [
        { model: Warehouse, as: 'warehouse', attributes: ['id', 'name', 'code'] },
        { model: Location, as: 'location', attributes: ['id', 'name', 'code'] },
        { model: User, as: 'creator', attributes: ['id', 'first_name', 'last_name'] }
      ]
    });

    const response = getPagingData(data, page, limit);

    res.json({
      success: true,
      data: response
    });
  } catch (error) {
    next(error);
  }
};

// Get current stock levels (for Stock List page)
exports.getCurrentStockLevels = async (req, res, next) => {
  try {
    const { Category, Unit } = require('../models');
    
    const stocks = await Stock.findAll({
      where: {
        quantity: { [Op.gt]: 0 } // Only show stocks with quantity > 0
      },
      include: [
        {
          model: Product,
          as: 'product',
          attributes: ['id', 'name', 'sku', 'barcode', 'cost_price', 'sale_price', 'min_stock_level'],
          where: { is_active: true },
          include: [
            { model: Category, as: 'category', attributes: ['id', 'name'] },
            { model: Unit, as: 'unit', attributes: ['id', 'name', 'abbreviation'] }
          ]
        },
        {
          model: Warehouse,
          as: 'warehouse',
          attributes: ['id', 'name', 'code'],
          where: { is_active: true }
        }
      ],
      order: [['quantity', 'DESC']]
    });

    res.json({
      success: true,
      data: stocks
    });
  } catch (error) {
    console.error('❌ Current stock levels error:', error);
    next(error);
  }
};

