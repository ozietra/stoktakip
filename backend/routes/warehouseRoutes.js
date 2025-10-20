const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { validate } = require('../middleware/validation');
const { protect, authorize } = require('../middleware/auth');
const warehouseController = require('../controllers/warehouseController');

// Validation
const warehouseValidation = [
  body('name').trim().notEmpty().withMessage('Depo adı gerekli'),
  body('code').trim().notEmpty().withMessage('Depo kodu gerekli')
];

// Routes
router.get('/', protect, warehouseController.getAllWarehouses);
router.get('/:id', protect, warehouseController.getWarehouseById);
router.post('/', protect, authorize('admin'), warehouseValidation, validate, warehouseController.createWarehouse);
router.put('/:id', protect, authorize('admin'), warehouseController.updateWarehouse);
router.delete('/:id', protect, authorize('admin'), warehouseController.deleteWarehouse);

module.exports = router;

