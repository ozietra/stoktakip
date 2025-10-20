const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { validate } = require('../middleware/validation');
const { protect, authorize } = require('../middleware/auth');
const categoryController = require('../controllers/categoryController');

// Validation
const categoryValidation = [
  body('name').trim().notEmpty().withMessage('Kategori adı gerekli')
];

// Routes
router.get('/', protect, categoryController.getAllCategories);
router.get('/tree', protect, categoryController.getCategoryTree);
router.get('/:id', protect, categoryController.getCategoryById);
router.post('/', protect, authorize('admin', 'manager'), categoryValidation, validate, categoryController.createCategory);
router.put('/:id', protect, authorize('admin', 'manager'), categoryController.updateCategory);
router.delete('/:id', protect, authorize('admin', 'manager'), categoryController.deleteCategory);

module.exports = router;

