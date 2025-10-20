const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { validate } = require('../middleware/validation');
const { protect, authorize } = require('../middleware/auth');
const stockMovementController = require('../controllers/stockMovementController');

// Validation rules
const stockInValidation = [
  body('product_id').isInt().withMessage('Ürün ID gerekli'),
  body('warehouse_id').isInt().withMessage('Depo ID gerekli'),
  body('quantity').isFloat({ gt: 0 }).withMessage('Miktar 0\'dan büyük olmalı')
];

const stockOutValidation = [
  body('product_id').isInt().withMessage('Ürün ID gerekli'),
  body('warehouse_id').isInt().withMessage('Depo ID gerekli'),
  body('quantity').isFloat({ gt: 0 }).withMessage('Miktar 0\'dan büyük olmalı')
];

const transferValidation = [
  body('product_id').isInt().withMessage('Ürün ID gerekli'),
  body('from_warehouse_id').isInt().withMessage('Kaynak depo ID gerekli'),
  body('to_warehouse_id').isInt().withMessage('Hedef depo ID gerekli'),
  body('quantity').isFloat({ gt: 0 }).withMessage('Miktar 0\'dan büyük olmalı')
];

const adjustValidation = [
  body('product_id').isInt().withMessage('Ürün ID gerekli'),
  body('warehouse_id').isInt().withMessage('Depo ID gerekli'),
  body('new_quantity').isFloat({ gte: 0 }).withMessage('Yeni miktar 0 veya daha büyük olmalı')
];

// Routes
router.get('/', protect, stockMovementController.getAllMovements);
router.get('/current', protect, stockMovementController.getCurrentStockLevels); // Must be before /:id
router.get('/product/:productId', protect, stockMovementController.getProductMovements);
router.get('/:id', protect, stockMovementController.getMovementById);
router.post('/in', protect, authorize('admin', 'manager', 'staff'), stockInValidation, validate, stockMovementController.createStockIn);
router.post('/out', protect, authorize('admin', 'manager', 'staff'), stockOutValidation, validate, stockMovementController.createStockOut);
router.post('/transfer', protect, authorize('admin', 'manager'), transferValidation, validate, stockMovementController.createStockTransfer);
router.post('/adjust', protect, authorize('admin', 'manager'), adjustValidation, validate, stockMovementController.adjustStock);

module.exports = router;

