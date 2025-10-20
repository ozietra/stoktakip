const { Category } = require('../models');
const { Op } = require('sequelize');

// Get all categories
exports.getAllCategories = async (req, res, next) => {
  try {
    const { search, is_active, parent_id } = req.query;
    
    const where = { is_active: true }; // Varsayılan olarak sadece aktifler
    if (search) where.name = { [Op.like]: `%${search}%` };
    if (is_active !== undefined) where.is_active = is_active === 'true';
    if (parent_id !== undefined) where.parent_id = parent_id === 'null' ? null : parent_id;

    const categories = await Category.findAll({
      where,
      order: [['sort_order', 'ASC'], ['name', 'ASC']],
      include: [
        { model: Category, as: 'parent', attributes: ['id', 'name'] },
        { model: Category, as: 'children', attributes: ['id', 'name', 'icon', 'color'] }
      ]
    });

    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    next(error);
  }
};

// Get category tree
exports.getCategoryTree = async (req, res, next) => {
  try {
    const categories = await Category.findAll({
      where: { parent_id: null, is_active: true },
      order: [['sort_order', 'ASC'], ['name', 'ASC']],
      include: [{
        model: Category,
        as: 'children',
        where: { is_active: true },
        required: false,
        include: [{
          model: Category,
          as: 'children',
          where: { is_active: true },
          required: false
        }]
      }]
    });

    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    next(error);
  }
};

// Get category by ID
exports.getCategoryById = async (req, res, next) => {
  try {
    const category = await Category.findByPk(req.params.id, {
      include: [
        { model: Category, as: 'parent' },
        { model: Category, as: 'children' }
      ]
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Kategori bulunamadı'
      });
    }

    res.json({
      success: true,
      data: category
    });
  } catch (error) {
    next(error);
  }
};

// Create category
exports.createCategory = async (req, res, next) => {
  try {
    const category = await Category.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Kategori başarıyla oluşturuldu',
      data: category
    });
  } catch (error) {
    next(error);
  }
};

// Update category
exports.updateCategory = async (req, res, next) => {
  try {
    const category = await Category.findByPk(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Kategori bulunamadı'
      });
    }

    await category.update(req.body);

    res.json({
      success: true,
      message: 'Kategori güncellendi',
      data: category
    });
  } catch (error) {
    next(error);
  }
};

// Delete category
exports.deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findByPk(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Kategori bulunamadı'
      });
    }

    // Check if category is used in active products
    const { Product } = require('../models');
    const activeProductCount = await Product.count({ 
      where: { category_id: req.params.id, is_active: true } 
    });
    
    if (activeProductCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Bu kategori ${activeProductCount} aktif üründe kullanılıyor. Önce bu ürünlerin kategorilerini değiştirin.`
      });
    }

    // Check if category has active children
    const activeChildrenCount = await Category.count({
      where: { parent_id: req.params.id, is_active: true }
    });

    if (activeChildrenCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Bu kategorinin ${activeChildrenCount} alt kategorisi var. Önce alt kategorileri silin.`
      });
    }

    await category.update({ is_active: false });

    res.json({
      success: true,
      message: 'Kategori silindi'
    });
  } catch (error) {
    next(error);
  }
};

