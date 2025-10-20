const { Stock, StockMovement, Product, Warehouse } = require('../models');
const { sequelize } = require('../config/database');

/**
 * Update stock quantity after a movement
 */
exports.updateStock = async (productId, warehouseId, locationId, quantity, type, transaction = null) => {
  try {
    const options = transaction ? { transaction } : {};

    // Find or create stock record
    const [stock] = await Stock.findOrCreate({
      where: {
        product_id: productId,
        warehouse_id: warehouseId,
        location_id: locationId || null
      },
      defaults: {
        quantity: 0,
        reserved_quantity: 0,
        available_quantity: 0,
        average_cost: 0
      },
      ...options
    });

    // Update quantity based on movement type
    let newQuantity = parseFloat(stock.quantity);
    
    if (['in', 'return', 'production'].includes(type)) {
      newQuantity += parseFloat(quantity);
    } else if (['out', 'transfer', 'loss'].includes(type)) {
      newQuantity -= parseFloat(quantity);
    } else if (type === 'adjustment') {
      newQuantity = parseFloat(quantity); // Direct set for adjustments
    }

    // Update available quantity
    const availableQuantity = newQuantity - parseFloat(stock.reserved_quantity);

    await stock.update({
      quantity: newQuantity,
      available_quantity: availableQuantity
    }, options);

    return stock;
  } catch (error) {
    throw error;
  }
};

/**
 * Reserve stock for orders
 */
exports.reserveStock = async (productId, warehouseId, quantity, transaction = null) => {
  try {
    const options = transaction ? { transaction } : {};

    const stock = await Stock.findOne({
      where: {
        product_id: productId,
        warehouse_id: warehouseId
      },
      ...options
    });

    if (!stock) {
      throw new Error('Stok kaydı bulunamadı');
    }

    if (stock.available_quantity < quantity) {
      throw new Error('Yetersiz stok');
    }

    const newReservedQuantity = parseFloat(stock.reserved_quantity) + parseFloat(quantity);
    const newAvailableQuantity = parseFloat(stock.quantity) - newReservedQuantity;

    await stock.update({
      reserved_quantity: newReservedQuantity,
      available_quantity: newAvailableQuantity
    }, options);

    return stock;
  } catch (error) {
    throw error;
  }
};

/**
 * Release reserved stock
 */
exports.releaseStock = async (productId, warehouseId, quantity, transaction = null) => {
  try {
    const options = transaction ? { transaction } : {};

    const stock = await Stock.findOne({
      where: {
        product_id: productId,
        warehouse_id: warehouseId
      },
      ...options
    });

    if (!stock) {
      throw new Error('Stok kaydı bulunamadı');
    }

    const newReservedQuantity = Math.max(0, parseFloat(stock.reserved_quantity) - parseFloat(quantity));
    const newAvailableQuantity = parseFloat(stock.quantity) - newReservedQuantity;

    await stock.update({
      reserved_quantity: newReservedQuantity,
      available_quantity: newAvailableQuantity
    }, options);

    return stock;
  } catch (error) {
    throw error;
  }
};

/**
 * Get total stock for a product across all warehouses
 */
exports.getTotalStock = async (productId) => {
  try {
    const result = await Stock.sum('quantity', {
      where: { product_id: productId }
    });

    return result || 0;
  } catch (error) {
    throw error;
  }
};

/**
 * Check if product is below minimum stock level
 */
exports.checkMinimumStock = async (productId) => {
  try {
    const product = await Product.findByPk(productId);
    if (!product) return false;

    const totalStock = await this.getTotalStock(productId);
    
    return totalStock <= product.min_stock_level;
  } catch (error) {
    throw error;
  }
};

/**
 * Calculate average cost for a product
 */
exports.calculateAverageCost = async (productId, warehouseId) => {
  try {
    const movements = await StockMovement.findAll({
      where: {
        product_id: productId,
        warehouse_id: warehouseId,
        type: ['in', 'purchase']
      },
      order: [['movement_date', 'DESC']],
      limit: 10
    });

    if (movements.length === 0) return 0;

    const totalCost = movements.reduce((sum, movement) => {
      return sum + (parseFloat(movement.unit_price) * parseFloat(movement.quantity));
    }, 0);

    const totalQuantity = movements.reduce((sum, movement) => {
      return sum + parseFloat(movement.quantity);
    }, 0);

    return totalQuantity > 0 ? totalCost / totalQuantity : 0;
  } catch (error) {
    throw error;
  }
};

module.exports = exports;

