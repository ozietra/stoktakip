const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { Campaign } = require('../models');
const { Op } = require('sequelize');

// Get all campaigns
router.get('/', protect, async (req, res, next) => {
  try {
    const { is_active } = req.query;
    const where = {};
    
    if (is_active !== undefined) where.is_active = is_active === 'true';

    const campaigns = await Campaign.findAll({
      where,
      order: [['start_date', 'DESC']]
    });

    res.json({ success: true, data: campaigns });
  } catch (error) {
    next(error);
  }
});

// Get active campaigns
router.get('/active', protect, async (req, res, next) => {
  try {
    const now = new Date();
    const campaigns = await Campaign.findAll({
      where: {
        is_active: true,
        start_date: { [Op.lte]: now },
        end_date: { [Op.gte]: now }
      },
      order: [['start_date', 'DESC']]
    });

    res.json({ success: true, data: campaigns });
  } catch (error) {
    next(error);
  }
});

// Create campaign
router.post('/', protect, authorize('admin', 'manager'), async (req, res, next) => {
  try {
    const campaign = await Campaign.create({
      ...req.body,
      created_by: req.user.id
    });
    res.status(201).json({ success: true, message: 'Kampanya oluşturuldu', data: campaign });
  } catch (error) {
    next(error);
  }
});

// Update campaign
router.put('/:id', protect, authorize('admin', 'manager'), async (req, res, next) => {
  try {
    const campaign = await Campaign.findByPk(req.params.id);
    if (!campaign) {
      return res.status(404).json({ success: false, message: 'Kampanya bulunamadı' });
    }
    await campaign.update(req.body);
    res.json({ success: true, message: 'Kampanya güncellendi', data: campaign });
  } catch (error) {
    next(error);
  }
});

// Delete campaign
router.delete('/:id', protect, authorize('admin', 'manager'), async (req, res, next) => {
  try {
    const campaign = await Campaign.findByPk(req.params.id);
    if (!campaign) {
      return res.status(404).json({ success: false, message: 'Kampanya bulunamadı' });
    }
    await campaign.destroy();
    res.json({ success: true, message: 'Kampanya silindi' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

