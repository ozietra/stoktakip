const { recoverConnection, getConnectionStatus } = require('../config/database');

// Database error handler middleware
const handleDatabaseError = async (error, req, res, next) => {
  // Check if it's a database connection error
  const isConnectionError = 
    error.name === 'SequelizeConnectionError' ||
    error.name === 'SequelizeConnectionRefusedError' ||
    error.name === 'SequelizeConnectionTimedOutError' ||
    error.name === 'SequelizeHostNotFoundError' ||
    error.name === 'SequelizeHostNotReachableError' ||
    error.name === 'SequelizeInvalidConnectionError' ||
    (error.message && error.message.includes('ConnectionManager.getConnection was called after the connection manager was closed'));

  if (isConnectionError) {
    console.error('🔥 Database connection error detected:', error.message);
    
    // Try to recover the connection
    const recovered = await recoverConnection();
    
    if (recovered) {
      console.log('✅ Connection recovered, retrying request...');
      // Don't retry automatically to avoid infinite loops
      // Just return a specific error that the client can handle
      return res.status(503).json({
        success: false,
        message: 'Veritabanı bağlantısı geçici olarak kesildi, lütfen tekrar deneyin',
        code: 'DB_CONNECTION_RECOVERED',
        retry: true
      });
    } else {
      console.error('❌ Connection recovery failed');
      return res.status(503).json({
        success: false,
        message: 'Veritabanı bağlantısı kurulamıyor, lütfen daha sonra tekrar deneyin',
        code: 'DB_CONNECTION_FAILED',
        retry: false
      });
    }
  }

  // Handle other database errors
  if (error.name && error.name.startsWith('Sequelize')) {
    console.error('🔥 Database error:', error.message);
    
    // Check connection status
    const status = getConnectionStatus();
    if (!status.healthy) {
      return res.status(503).json({
        success: false,
        message: 'Veritabanı bağlantısı sağlıksız, lütfen tekrar deneyin',
        code: 'DB_UNHEALTHY'
      });
    }

    // Generic database error
    return res.status(500).json({
      success: false,
      message: 'Veritabanı işlemi sırasında hata oluştu',
      code: 'DB_OPERATION_ERROR',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }

  // Not a database error, pass to next error handler
  next(error);
};

// Middleware to check database health before processing requests
const checkDatabaseHealth = async (req, res, next) => {
  const status = getConnectionStatus();
  
  // If last health check was more than 2 minutes ago, it might be stale
  if (status.timeSinceLastCheck > 120000) {
    console.warn('⚠️ Database health check is stale, connection might be unhealthy');
  }
  
  // If connection is known to be unhealthy, return error immediately
  if (!status.healthy) {
    return res.status(503).json({
      success: false,
      message: 'Veritabanı bağlantısı şu anda kullanılamıyor',
      code: 'DB_UNAVAILABLE'
    });
  }
  
  next();
};

module.exports = {
  handleDatabaseError,
  checkDatabaseHealth
};
