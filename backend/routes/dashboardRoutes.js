const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const dashboardController = require('../controllers/dashboardController');

// Test endpoint (no auth)
router.get('/test', (req, res) => {
  console.log('✅ TEST endpoint reached!');
  res.json({ success: true, message: 'Dashboard routes working!' });
});

// Routes
router.get('/stats', protect, dashboardController.getDashboardStats);
router.get('/sales-chart', protect, dashboardController.getSalesChart);
router.get('/top-products', protect, dashboardController.getTopProducts);
router.get('/stock-alerts', protect, dashboardController.getStockAlerts);

module.exports = router;

