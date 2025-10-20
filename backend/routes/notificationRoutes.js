const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { Notification } = require('../models');
const { getPagination, getPagingData } = require('../utils/pagination');

// Get user notifications
router.get('/', protect, async (req, res, next) => {
  try {
    const { page, size, is_read } = req.query;
    const { limit, offset } = getPagination(page, size);

    const where = { user_id: req.user.id };
    if (is_read !== undefined) where.is_read = is_read === 'true';

    const data = await Notification.findAndCountAll({
      where,
      limit,
      offset,
      order: [['createdAt', 'DESC']]
    });

    const response = getPagingData(data, page, limit);
    res.json({ success: true, data: response });
  } catch (error) {
    next(error);
  }
});

// Get unread count
router.get('/unread-count', protect, async (req, res, next) => {
  try {
    const count = await Notification.count({
      where: {
        user_id: req.user.id,
        is_read: false
      }
    });

    res.json({ success: true, data: { count } });
  } catch (error) {
    next(error);
  }
});

// Mark as read
router.put('/:id/read', protect, async (req, res, next) => {
  try {
    const notification = await Notification.findOne({
      where: { id: req.params.id, user_id: req.user.id }
    });

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Bildirim bulunamadı' });
    }

    await notification.update({ is_read: true, read_at: new Date() });
    res.json({ success: true, message: 'Bildirim okundu olarak işaretlendi' });
  } catch (error) {
    next(error);
  }
});

// Mark all as read
router.put('/mark-all-read', protect, async (req, res, next) => {
  try {
    await Notification.update(
      { is_read: true, read_at: new Date() },
      { where: { user_id: req.user.id, is_read: false } }
    );

    res.json({ success: true, message: 'Tüm bildirimler okundu olarak işaretlendi' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

