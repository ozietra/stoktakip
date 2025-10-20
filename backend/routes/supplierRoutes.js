const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { Supplier } = require('../models');
const { Op } = require('sequelize');
const { getPagination, getPagingData } = require('../utils/pagination');

// Get all suppliers
router.get('/', protect, async (req, res, next) => {
  try {
    const { page, size, search, is_active } = req.query;
    const { limit, offset } = getPagination(page, size);

    const where = { is_active: true }; // Varsayılan olarak sadece aktifler
    if (search) where.name = { [Op.like]: `%${search}%` };
    if (is_active !== undefined) where.is_active = is_active === 'true';

    const data = await Supplier.findAndCountAll({
      where,
      limit,
      offset,
      order: [['name', 'ASC']]
    });

    const response = getPagingData(data, page, limit);
    res.json({ success: true, data: response });
  } catch (error) {
    next(error);
  }
});

// Get supplier by ID
router.get('/:id', protect, async (req, res, next) => {
  try {
    const supplier = await Supplier.findByPk(req.params.id);
    if (!supplier) {
      return res.status(404).json({ success: false, message: 'Tedarikçi bulunamadı' });
    }
    res.json({ success: true, data: supplier });
  } catch (error) {
    next(error);
  }
});

// Create supplier
router.post('/', protect, authorize('admin', 'manager'), async (req, res, next) => {
  try {
    const supplier = await Supplier.create(req.body);
    res.status(201).json({ success: true, message: 'Tedarikçi oluşturuldu', data: supplier });
  } catch (error) {
    next(error);
  }
});

// Update supplier
router.put('/:id', protect, authorize('admin', 'manager'), async (req, res, next) => {
  try {
    const supplier = await Supplier.findByPk(req.params.id);
    if (!supplier) {
      return res.status(404).json({ success: false, message: 'Tedarikçi bulunamadı' });
    }
    await supplier.update(req.body);
    res.json({ success: true, message: 'Tedarikçi güncellendi', data: supplier });
  } catch (error) {
    next(error);
  }
});

// Delete supplier
router.delete('/:id', protect, authorize('admin'), async (req, res, next) => {
  try {
    const supplier = await Supplier.findByPk(req.params.id);
    if (!supplier) {
      return res.status(404).json({ success: false, message: 'Tedarikçi bulunamadı' });
    }
    await supplier.update({ is_active: false });
    res.json({ success: true, message: 'Tedarikçi silindi' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

