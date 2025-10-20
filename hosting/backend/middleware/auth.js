const jwt = require('jsonwebtoken');
const { User } = require('../models');

// Verify JWT token
exports.protect = async (req, res, next) => {
  try {
    console.log('🔒 Auth middleware called for:', req.path);
    
    let token;

    // Check for token in headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
      console.log('✅ Token found');
    }

    if (!token) {
      console.log('❌ No token provided');
      return res.status(401).json({
        success: false,
        message: 'Erişim için giriş yapmanız gerekiyor'
      });
    }

    try {
      // Verify token
      console.log('🔍 Verifying token...');
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('✅ Token verified for user ID:', decoded.id);

      // Get user from token
      req.user = await User.findByPk(decoded.id);

      if (!req.user) {
        console.log('❌ User not found');
        return res.status(401).json({
          success: false,
          message: 'Kullanıcı bulunamadı'
        });
      }

      if (!req.user.is_active) {
        console.log('❌ User not active');
        return res.status(401).json({
          success: false,
          message: 'Hesabınız devre dışı bırakılmış'
        });
      }

      console.log('✅ Auth successful, proceeding...');
      next();
    } catch (error) {
      console.log('❌ Token verification failed:', error.message);
      return res.status(401).json({
        success: false,
        message: 'Token geçersiz veya süresi dolmuş'
      });
    }
  } catch (error) {
    console.log('❌ Auth middleware error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Sunucu hatası'
    });
  }
};

// Check user role
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Bu işlem için yetkiniz yok'
      });
    }
    next();
  };
};

// Optional auth - doesn't fail if no token
exports.optionalAuth = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findByPk(decoded.id);
      } catch (error) {
        // Token invalid, but continue without user
        req.user = null;
      }
    }

    next();
  } catch (error) {
    next(error);
  }
};

