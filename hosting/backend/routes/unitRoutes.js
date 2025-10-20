const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { Unit } = require('../models');

// Get all units
router.get('/', protect, async (req, res, next) => {
  try {
    const units = await Unit.findAll({
      where: { is_active: true },
      order: [['name', 'ASC']]
    });
    res.json({ success: true, data: units });
  } catch (error) {
    next(error);
  }
});

// Get unit by ID
router.get('/:id', protect, async (req, res, next) => {
  try {
    const unit = await Unit.findByPk(req.params.id);
    if (!unit) {
      return res.status(404).json({ success: false, message: 'Birim bulunamadı' });
    }
    res.json({ success: true, data: unit });
  } catch (error) {
    next(error);
  }
});

// Create unit
router.post('/', protect, authorize('admin', 'manager'), async (req, res, next) => {
  try {
    const unit = await Unit.create(req.body);
    res.status(201).json({ success: true, message: 'Birim oluşturuldu', data: unit });
  } catch (error) {
    next(error);
  }
});

// Update unit
router.put('/:id', protect, authorize('admin', 'manager'), async (req, res, next) => {
  try {
    const unit = await Unit.findByPk(req.params.id);
    if (!unit) {
      return res.status(404).json({ success: false, message: 'Birim bulunamadı' });
    }
    await unit.update(req.body);
    res.json({ success: true, message: 'Birim güncellendi', data: unit });
  } catch (error) {
    next(error);
  }
});

// Delete unit
router.delete('/:id', protect, authorize('admin', 'manager'), async (req, res, next) => {
  try {
    const unit = await Unit.findByPk(req.params.id);
    if (!unit) {
      return res.status(404).json({ success: false, message: 'Birim bulunamadı' });
    }
    
    // Check if unit is used in products (including soft-deleted products)
    const { Product } = require('../models');
    const productCount = await Product.count({ 
      where: { unit_id: req.params.id },
      paranoid: false // Include soft-deleted products
    });
    
    if (productCount > 0) {
      // If there are soft-deleted products, offer to clean them up
      const activeProductCount = await Product.count({ where: { unit_id: req.params.id, is_active: true } });
      
      if (activeProductCount === 0 && productCount > 0) {
        // Only soft-deleted products exist, force delete them
        await Product.destroy({ 
          where: { unit_id: req.params.id, is_active: false },
          force: true // Hard delete
        });
        
        await unit.destroy();
        return res.json({ 
          success: true, 
          message: `Birim silindi (${productCount} pasif ürün temizlendi)` 
        });
      }
      
      return res.status(400).json({ 
        success: false, 
        message: `Bu birim ${activeProductCount} aktif üründe kullanılıyor. Önce bu ürünlerin birimlerini değiştirin.` 
      });
    }
    
    await unit.destroy();
    res.json({ success: true, message: 'Birim silindi' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

