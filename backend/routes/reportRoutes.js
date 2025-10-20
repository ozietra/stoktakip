const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

// Placeholder routes - will be implemented later
router.get('/stock-value', protect, async (req, res) => {
  res.json({ success: true, data: {}, message: 'Report routes - coming soon' });
});

router.get('/abc-analysis', protect, async (req, res) => {
  res.json({ success: true, data: {}, message: 'ABC Analysis - coming soon' });
});

module.exports = router;

