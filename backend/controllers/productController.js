const { Product, Category, Unit, Stock, User } = require('../models');
const { Op } = require('sequelize');
const { getPagination, getPagingData } = require('../utils/pagination');

// Get all products
exports.getAllProducts = async (req, res, next) => {
  try {
    const { page, size, search, category_id, is_active, sort } = req.query;
    const { limit, offset } = getPagination(page, size);

    // Build where clause
    const where = { is_active: true }; // Varsayılan olarak sadece aktifler
    
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { sku: { [Op.like]: `%${search}%` } },
        { barcode: { [Op.like]: `%${search}%` } }
      ];
    }

    if (category_id) {
      where.category_id = category_id;
    }

    if (is_active !== undefined) {
      where.is_active = is_active === 'true';
    }

    // Build order clause
    let order = [['createdAt', 'DESC']];
    if (sort) {
      const [field, direction] = sort.split(':');
      order = [[field, direction.toUpperCase()]];
    }

    const data = await Product.findAndCountAll({
      where,
      limit,
      offset,
      order,
      include: [
        { model: Category, as: 'category', attributes: ['id', 'name', 'name_en'] },
        { model: Unit, as: 'unit', attributes: ['id', 'name', 'abbreviation'] },
        { model: User, as: 'creator', attributes: ['id', 'first_name', 'last_name'] }
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

// Get product by ID
exports.getProductById = async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.id, {
      include: [
        { model: Category, as: 'category' },
        { model: Unit, as: 'unit' },
        { model: Stock, as: 'stocks', include: ['warehouse', 'location'] },
        { model: User, as: 'creator', attributes: ['id', 'first_name', 'last_name'] }
      ]
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Ürün bulunamadı'
      });
    }

    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    next(error);
  }
};

// Create product
exports.createProduct = async (req, res, next) => {
  try {
    const productData = {
      ...req.body,
      created_by: req.user.id
    };

    // Check if SKU or barcode already exists
    if (productData.sku) {
      const existingSku = await Product.findOne({ where: { sku: productData.sku } });
      if (existingSku) {
        return res.status(400).json({
          success: false,
          message: 'Bu SKU zaten kullanılıyor'
        });
      }
    }

    if (productData.barcode) {
      const existingBarcode = await Product.findOne({ where: { barcode: productData.barcode } });
      if (existingBarcode) {
        return res.status(400).json({
          success: false,
          message: 'Bu barkod zaten kullanılıyor'
        });
      }
    }

    const product = await Product.create(productData);

    res.status(201).json({
      success: true,
      message: 'Ürün başarıyla oluşturuldu',
      data: product
    });
  } catch (error) {
    next(error);
  }
};

// Update product
exports.updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Ürün bulunamadı'
      });
    }

    // Check SKU uniqueness if changed
    if (req.body.sku && req.body.sku !== product.sku) {
      const existingSku = await Product.findOne({ 
        where: { 
          sku: req.body.sku,
          id: { [Op.ne]: req.params.id }
        } 
      });
      if (existingSku) {
        return res.status(400).json({
          success: false,
          message: 'Bu SKU zaten kullanılıyor'
        });
      }
    }

    // Check barcode uniqueness if changed
    if (req.body.barcode && req.body.barcode !== product.barcode) {
      const existingBarcode = await Product.findOne({ 
        where: { 
          barcode: req.body.barcode,
          id: { [Op.ne]: req.params.id }
        } 
      });
      if (existingBarcode) {
        return res.status(400).json({
          success: false,
          message: 'Bu barkod zaten kullanılıyor'
        });
      }
    }

    await product.update(req.body);

    res.json({
      success: true,
      message: 'Ürün güncellendi',
      data: product
    });
  } catch (error) {
    next(error);
  }
};

// Delete product
exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Ürün bulunamadı'
      });
    }

    // Soft delete - just mark as inactive
    await product.update({ is_active: false });

    res.json({
      success: true,
      message: 'Ürün silindi'
    });
  } catch (error) {
    next(error);
  }
};

// Get product by barcode
exports.getProductByBarcode = async (req, res, next) => {
  try {
    const product = await Product.findOne({
      where: { barcode: req.params.barcode },
      include: [
        { model: Category, as: 'category' },
        { model: Unit, as: 'unit' },
        { model: Stock, as: 'stocks', include: ['warehouse'] }
      ]
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Ürün bulunamadı'
      });
    }

    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    next(error);
  }
};

// Get low stock products
exports.getLowStockProducts = async (req, res, next) => {
  try {
    const { sequelize } = require('../config/database');

    const products = await Product.findAll({
      where: {
        is_active: true,
        is_trackable: true
      },
      include: [
        {
          model: Stock,
          as: 'stocks',
          attributes: [
            [sequelize.fn('SUM', sequelize.col('stocks.quantity')), 'total_quantity']
          ]
        },
        { model: Category, as: 'category', attributes: ['id', 'name'] },
        { model: Unit, as: 'unit', attributes: ['id', 'name', 'abbreviation'] }
      ],
      group: ['Product.id'],
      having: sequelize.where(
        sequelize.fn('SUM', sequelize.col('stocks.quantity')),
        '<=',
        sequelize.col('Product.min_stock_level')
      )
    });

    res.json({
      success: true,
      data: products
    });
  } catch (error) {
    next(error);
  }
};

