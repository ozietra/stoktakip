const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { validate } = require('../middleware/validation');
const { protect } = require('../middleware/auth');
const authController = require('../controllers/authController');

// Validation rules
const registerValidation = [
  body('username').trim().isLength({ min: 3 }).withMessage('Kullanıcı adı en az 3 karakter olmalı'),
  body('email').isEmail().withMessage('Geçerli bir e-posta adresi giriniz'),
  body('password').isLength({ min: 6 }).withMessage('Şifre en az 6 karakter olmalı'),
  body('first_name').trim().notEmpty().withMessage('Ad gerekli'),
  body('last_name').trim().notEmpty().withMessage('Soyad gerekli')
];

const loginValidation = [
  body('email').isEmail().withMessage('Geçerli bir e-posta adresi giriniz'),
  body('password').notEmpty().withMessage('Şifre gerekli')
];

const changePasswordValidation = [
  body('currentPassword').notEmpty().withMessage('Mevcut şifre gerekli'),
  body('newPassword').isLength({ min: 6 }).withMessage('Yeni şifre en az 6 karakter olmalı')
];

// Routes
// Health check endpoint (for Electron)
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Backend is running' });
});

router.post('/register', registerValidation, validate, authController.register);
router.post('/login', loginValidation, validate, authController.login);
router.get('/me', protect, authController.getMe);
router.put('/profile', protect, authController.updateProfile);
router.post('/change-password', protect, changePasswordValidation, validate, authController.changePassword);
router.post('/logout', protect, authController.logout);

// User management routes (admin only)
const { authorize } = require('../middleware/auth');
const { User } = require('../models');

router.get('/users', protect, authorize('admin'), async (req, res, next) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']]
    });
    res.json({ success: true, data: users });
  } catch (error) {
    next(error);
  }
});

// Create new user (admin only)
const createUserValidation = [
  body('username').trim().isLength({ min: 3 }).withMessage('Kullanıcı adı en az 3 karakter olmalı'),
  body('email').isEmail().withMessage('Geçerli bir e-posta adresi giriniz'),
  body('password').isLength({ min: 6 }).withMessage('Şifre en az 6 karakter olmalı'),
  body('first_name').trim().notEmpty().withMessage('Ad gerekli'),
  body('last_name').trim().notEmpty().withMessage('Soyad gerekli'),
  body('role').isIn(['admin', 'manager', 'staff']).withMessage('Geçersiz rol')
];

router.post('/users', protect, authorize('admin'), createUserValidation, validate, async (req, res, next) => {
  try {
    const { username, email, password, first_name, last_name, role, phone, is_active } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ where: { [require('sequelize').Op.or]: [{ email }, { username }] } });
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: existingUser.email === email ? 'Bu e-posta zaten kullanılıyor' : 'Bu kullanıcı adı zaten kullanılıyor'
      });
    }

    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      first_name,
      last_name,
      role: role || 'staff',
      phone,
      is_active: is_active !== undefined ? is_active : true
    });

    const userResponse = user.toJSON();
    delete userResponse.password;

    res.status(201).json({ 
      success: true, 
      message: 'Kullanıcı başarıyla oluşturuldu', 
      data: userResponse 
    });
  } catch (error) {
    next(error);
  }
});

router.put('/users/:id', protect, authorize('admin'), async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Kullanıcı bulunamadı' });
    }
    
    const { password, ...updateData } = req.body;
    if (password) {
      const bcrypt = require('bcryptjs');
      updateData.password = await bcrypt.hash(password, 10);
    }
    
    await user.update(updateData);
    res.json({ success: true, message: 'Kullanıcı güncellendi', data: user });
  } catch (error) {
    next(error);
  }
});

router.delete('/users/:id', protect, authorize('admin'), async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Kullanıcı bulunamadı' });
    }
    
    if (user.role === 'admin') {
      return res.status(400).json({ success: false, message: 'Admin kullanıcı silinemez' });
    }
    
    await user.update({ is_active: false });
    res.json({ success: true, message: 'Kullanıcı silindi' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

