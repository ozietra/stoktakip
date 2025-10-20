const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { validate } = require('../middleware/validation');
const { protect, authorize } = require('../middleware/auth');
const productController = require('../controllers/productController');

// Validation rules
const productValidation = [
  body('sku').trim().notEmpty().withMessage('SKU gerekli'),
  body('name').trim().notEmpty().withMessage('Ürün adı gerekli'),
  body('unit_id').isInt().withMessage('Birim gerekli'),
  body('cost_price').optional().isDecimal().withMessage('Geçerli bir maliyet fiyatı giriniz'),
  body('sale_price').optional().isDecimal().withMessage('Geçerli bir satış fiyatı giriniz')
];

// Routes
router.get('/', protect, productController.getAllProducts);
router.get('/low-stock', protect, productController.getLowStockProducts);
router.get('/barcode/:barcode', protect, productController.getProductByBarcode);
router.get('/:id', protect, productController.getProductById);
router.post('/', protect, authorize('admin', 'manager'), productValidation, validate, productController.createProduct);
router.put('/:id', protect, authorize('admin', 'manager'), productController.updateProduct);
router.delete('/:id', protect, authorize('admin', 'manager'), productController.deleteProduct);

module.exports = router;

