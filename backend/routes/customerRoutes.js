const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { Customer } = require('../models');
const { Op } = require('sequelize');
const { getPagination, getPagingData } = require('../utils/pagination');

// Get all customers
router.get('/', protect, async (req, res, next) => {
  try {
    const { page, size, search, is_active, type } = req.query;
    const { limit, offset } = getPagination(page, size);

    const where = { is_active: true }; // Varsayılan olarak sadece aktifler
    if (search) where.name = { [Op.like]: `%${search}%` };
    if (is_active !== undefined) where.is_active = is_active === 'true';
    if (type) where.type = type;

    const data = await Customer.findAndCountAll({
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

// Get customer by ID
router.get('/:id', protect, async (req, res, next) => {
  try {
    const customer = await Customer.findByPk(req.params.id);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Müşteri bulunamadı' });
    }
    res.json({ success: true, data: customer });
  } catch (error) {
    next(error);
  }
});

// Create customer
router.post('/', protect, authorize('admin', 'manager', 'staff'), async (req, res, next) => {
  try {
    const customer = await Customer.create(req.body);
    res.status(201).json({ success: true, message: 'Müşteri oluşturuldu', data: customer });
  } catch (error) {
    next(error);
  }
});

// Update customer
router.put('/:id', protect, authorize('admin', 'manager', 'staff'), async (req, res, next) => {
  try {
    const customer = await Customer.findByPk(req.params.id);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Müşteri bulunamadı' });
    }
    await customer.update(req.body);
    res.json({ success: true, message: 'Müşteri güncellendi', data: customer });
  } catch (error) {
    next(error);
  }
});

// Delete customer
router.delete('/:id', protect, authorize('admin', 'manager'), async (req, res, next) => {
  try {
    const customer = await Customer.findByPk(req.params.id);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Müşteri bulunamadı' });
    }
    await customer.update({ is_active: false });
    res.json({ success: true, message: 'Müşteri silindi' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

