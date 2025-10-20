const { Warehouse, Location, Stock } = require('../models');
const { Op } = require('sequelize');

// Get all warehouses
exports.getAllWarehouses = async (req, res, next) => {
  try {
    const { search, is_active } = req.query;
    
    const where = { is_active: true }; // Varsayılan olarak sadece aktifler
    if (search) where.name = { [Op.like]: `%${search}%` };
    if (is_active !== undefined) where.is_active = is_active === 'true';

    const warehouses = await Warehouse.findAll({
      where,
      order: [['is_main', 'DESC'], ['name', 'ASC']],
      include: [
        { model: Location, as: 'locations', where: { is_active: true }, required: false }
      ]
    });

    res.json({
      success: true,
      data: warehouses
    });
  } catch (error) {
    next(error);
  }
};

// Get warehouse by ID
exports.getWarehouseById = async (req, res, next) => {
  try {
    const warehouse = await Warehouse.findByPk(req.params.id, {
      include: [
        { model: Location, as: 'locations' },
        { model: Stock, as: 'stocks', include: ['product'] }
      ]
    });

    if (!warehouse) {
      return res.status(404).json({
        success: false,
        message: 'Depo bulunamadı'
      });
    }

    res.json({
      success: true,
      data: warehouse
    });
  } catch (error) {
    next(error);
  }
};

// Create warehouse
exports.createWarehouse = async (req, res, next) => {
  try {
    const warehouse = await Warehouse.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Depo başarıyla oluşturuldu',
      data: warehouse
    });
  } catch (error) {
    next(error);
  }
};

// Update warehouse
exports.updateWarehouse = async (req, res, next) => {
  try {
    const warehouse = await Warehouse.findByPk(req.params.id);

    if (!warehouse) {
      return res.status(404).json({
        success: false,
        message: 'Depo bulunamadı'
      });
    }

    await warehouse.update(req.body);

    res.json({
      success: true,
      message: 'Depo güncellendi',
      data: warehouse
    });
  } catch (error) {
    next(error);
  }
};

// Delete warehouse
exports.deleteWarehouse = async (req, res, next) => {
  try {
    const warehouse = await Warehouse.findByPk(req.params.id);

    if (!warehouse) {
      return res.status(404).json({
        success: false,
        message: 'Depo bulunamadı'
      });
    }

    await warehouse.update({ is_active: false });

    res.json({
      success: true,
      message: 'Depo silindi'
    });
  } catch (error) {
    next(error);
  }
};

