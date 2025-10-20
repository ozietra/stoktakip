const { Notification, User, Product, Stock } = require('../models');

/**
 * Create low stock notification for admins
 */
exports.createLowStockNotification = async (productId) => {
  try {
    const product = await Product.findByPk(productId);
    if (!product) return;

    // Get total stock for the product
    const stocks = await Stock.findAll({
      where: { product_id: productId }
    });

    const totalStock = stocks.reduce((sum, stock) => sum + parseFloat(stock.quantity), 0);

    // Check if stock is below minimum level
    if (totalStock <= product.min_stock_level) {
      // Get admin and manager users
      const admins = await User.findAll({
        where: {
          role: ['admin', 'manager'],
          is_active: true
        }
      });

      // Create notifications for each admin
      for (const admin of admins) {
        // Check if notification already exists for this product in the last 24 hours
        const oneDayAgo = new Date();
        oneDayAgo.setHours(oneDayAgo.getHours() - 24);

        const existingNotification = await Notification.findOne({
          where: {
            user_id: admin.id,
            type: 'low_stock',
            related_type: 'product',
            related_id: productId,
            created_at: { [require('sequelize').Op.gte]: oneDayAgo }
          }
        });

        // Only create if no recent notification exists
        if (!existingNotification) {
          await Notification.create({
            user_id: admin.id,
            type: totalStock === 0 ? 'out_of_stock' : 'low_stock',
            title: totalStock === 0 ? 'Stok Tükendi' : 'Düşük Stok Uyarısı',
            message: totalStock === 0
              ? `${product.name} ürünü stokta kalmadı!`
              : `${product.name} ürünü minimum stok seviyesinin altında! Mevcut: ${totalStock}, Minimum: ${product.min_stock_level}`,
            priority: totalStock === 0 ? 'urgent' : 'high',
            related_type: 'product',
            related_id: product.id,
            action_url: `/products/${product.id}`
          });

          console.log(`📢 Low stock notification created for product ${product.name} (ID: ${productId})`);
        }
      }
    }
  } catch (error) {
    console.error('Error creating low stock notification:', error);
  }
};

/**
 * Create order received notification
 */
exports.createOrderNotification = async (orderId, orderNumber, userId) => {
  try {
    await Notification.create({
      user_id: userId,
      type: 'order_received',
      title: 'Sipariş Alındı',
      message: `${orderNumber} numaralı sipariş başarıyla oluşturuldu.`,
      priority: 'normal',
      related_type: 'order',
      related_id: orderId,
      action_url: `/orders/${orderId}`
    });
  } catch (error) {
    console.error('Error creating order notification:', error);
  }
};

/**
 * Create system notification for all users
 */
exports.createSystemNotification = async (title, message, priority = 'normal') => {
  try {
    const users = await User.findAll({
      where: { is_active: true }
    });

    for (const user of users) {
      await Notification.create({
        user_id: user.id,
        type: 'system',
        title,
        message,
        priority
      });
    }
  } catch (error) {
    console.error('Error creating system notification:', error);
  }
};

module.exports = exports;
