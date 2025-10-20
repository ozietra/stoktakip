const cron = require('node-cron');
const { Product, Stock, Notification, User } = require('../models');
const { Op } = require('sequelize');

// Check low stock levels every day at 9 AM
const checkLowStock = cron.schedule('0 9 * * *', async () => {
  try {
    console.log('Checking low stock levels...');

    const lowStockProducts = await Stock.findAll({
      include: [
        {
          model: Product,
          as: 'product',
          where: {
            is_active: true,
            is_trackable: true
          }
        }
      ]
    });

    for (const stock of lowStockProducts) {
      if (stock.product && stock.quantity <= stock.product.min_stock_level) {
        // Get admin users
        const admins = await User.findAll({
          where: {
            role: ['admin', 'manager'],
            is_active: true
          }
        });

        // Create notifications for admins
        for (const admin of admins) {
          await Notification.create({
            user_id: admin.id,
            type: 'low_stock',
            title: 'Düşük Stok Uyarısı',
            message: `${stock.product.name} ürünü minimum stok seviyesinin altında! Mevcut: ${stock.quantity}, Minimum: ${stock.product.min_stock_level}`,
            priority: 'high',
            related_type: 'product',
            related_id: stock.product.id,
            action_url: `/products/${stock.product.id}`
          });
        }
      }
    }

    console.log('Low stock check completed');
  } catch (error) {
    console.error('Error checking low stock:', error);
  }
}, {
  scheduled: false
});

// Check expiring products every day at 8 AM
const checkExpiringProducts = cron.schedule('0 8 * * *', async () => {
  try {
    console.log('Checking expiring products...');

    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const expiringProducts = await Product.findAll({
      where: {
        is_active: true,
        expiry_days: {
          [Op.lte]: 30,
          [Op.gt]: 0
        }
      }
    });

    if (expiringProducts.length > 0) {
      const admins = await User.findAll({
        where: {
          role: ['admin', 'manager'],
          is_active: true
        }
      });

      for (const admin of admins) {
        await Notification.create({
          user_id: admin.id,
          type: 'expiry_warning',
          title: 'Son Kullanma Tarihi Uyarısı',
          message: `${expiringProducts.length} ürünün son kullanma tarihi yaklaşıyor!`,
          priority: 'normal',
          related_type: 'products',
          action_url: '/products?filter=expiring'
        });
      }
    }

    console.log('Expiring products check completed');
  } catch (error) {
    console.error('Error checking expiring products:', error);
  }
}, {
  scheduled: false
});

// Clean up old notifications (older than 90 days) every week
const cleanupOldNotifications = cron.schedule('0 0 * * 0', async () => {
  try {
    console.log('Cleaning up old notifications...');

    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const deleted = await Notification.destroy({
      where: {
        is_read: true,
        created_at: {
          [Op.lt]: ninetyDaysAgo
        }
      }
    });

    console.log(`Deleted ${deleted} old notifications`);
  } catch (error) {
    console.error('Error cleaning up notifications:', error);
  }
}, {
  scheduled: false
});

// Start all cron jobs
exports.startAll = () => {
  console.log('Starting cron jobs...');
  checkLowStock.start();
  checkExpiringProducts.start();
  cleanupOldNotifications.start();
  console.log('All cron jobs started');
};

// Stop all cron jobs
exports.stopAll = () => {
  checkLowStock.stop();
  checkExpiringProducts.stop();
  cleanupOldNotifications.stop();
  console.log('All cron jobs stopped');
};

module.exports = exports;

