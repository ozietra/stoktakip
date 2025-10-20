const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { User } = require('../models');
const { getPagination, getPagingData } = require('../utils/pagination');
const { Op } = require('sequelize');

// Get all users (admin only)
router.get('/', protect, authorize('admin'), async (req, res, next) => {
  try {
    const { page, size, search, role, is_active } = req.query;
    const { limit, offset } = getPagination(page, size);

    const where = {};
    if (search) {
      where[Op.or] = [
        { first_name: { [Op.like]: `%${search}%` } },
        { last_name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } }
      ];
    }
    if (role) where.role = role;
    if (is_active !== undefined) where.is_active = is_active === 'true';

    const data = await User.findAndCountAll({
      where,
      limit,
      offset,
      order: [['createdAt', 'DESC']],
      attributes: { exclude: ['password'] }
    });

    const response = getPagingData(data, page, limit);
    res.json({ success: true, data: response });
  } catch (error) {
    next(error);
  }
});

// Get user by ID (admin only)
router.get('/:id', protect, authorize('admin'), async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Kullanıcı bulunamadı' });
    }
    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
});

// Update user (admin only)
router.put('/:id', protect, authorize('admin'), async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Kullanıcı bulunamadı' });
    }

    const { password, ...updateData } = req.body;
    await user.update(updateData);

    res.json({ success: true, message: 'Kullanıcı güncellendi', data: user });
  } catch (error) {
    next(error);
  }
});

// Deactivate user (admin only)
router.delete('/:id', protect, authorize('admin'), async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Kullanıcı bulunamadı' });
    }

    await user.update({ is_active: false });
    res.json({ success: true, message: 'Kullanıcı devre dışı bırakıldı' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

