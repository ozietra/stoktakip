const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { Location, Warehouse } = require('../models');

// Get all locations
router.get('/', protect, async (req, res, next) => {
  try {
    const { warehouse_id } = req.query;
    const where = { is_active: true };
    if (warehouse_id) where.warehouse_id = warehouse_id;

    const locations = await Location.findAll({
      where,
      include: [{ model: Warehouse, as: 'warehouse', attributes: ['id', 'name'] }],
      order: [['name', 'ASC']]
    });
    res.json({ success: true, data: locations });
  } catch (error) {
    next(error);
  }
});

// Create location
router.post('/', protect, authorize('admin', 'manager'), async (req, res, next) => {
  try {
    const location = await Location.create(req.body);
    res.status(201).json({ success: true, message: 'Lokasyon oluşturuldu', data: location });
  } catch (error) {
    next(error);
  }
});

// Update location
router.put('/:id', protect, authorize('admin', 'manager'), async (req, res, next) => {
  try {
    const location = await Location.findByPk(req.params.id);
    if (!location) {
      return res.status(404).json({ success: false, message: 'Lokasyon bulunamadı' });
    }
    await location.update(req.body);
    res.json({ success: true, message: 'Lokasyon güncellendi', data: location });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

