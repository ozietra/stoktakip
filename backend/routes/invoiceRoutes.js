const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

// Placeholder routes - will be implemented later
router.get('/', protect, async (req, res) => {
  res.json({ success: true, data: [], message: 'Invoice routes - coming soon' });
});

module.exports = router;

