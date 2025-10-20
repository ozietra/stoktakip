const { Product, Stock, Sale, PurchaseOrder, StockMovement, Customer, Supplier, Warehouse } = require('../models');
const { sequelize } = require('../config/database');
const { Op } = require('sequelize');

// Get dashboard statistics
exports.getDashboardStats = async (req, res, next) => {
  console.log('📊 Dashboard stats requested');
  
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfYear = new Date(today.getFullYear(), 0, 1);

    // Stats
    const totalProducts = await Product.count({ where: { is_active: true } }).catch(() => 0);
    const totalCustomers = await Customer.count({ where: { is_active: true } }).catch(() => 0);
    const totalSuppliers = await Supplier.count({ where: { is_active: true } }).catch(() => 0);
    
    // Sales stats
    const todaySales = await Sale.sum('total_amount', {
      where: { sale_date: { [Op.gte]: today }, status: { [Op.notIn]: ['cancelled'] } }
    }).catch(() => 0);

    const monthlySales = await Sale.sum('total_amount', {
      where: { sale_date: { [Op.gte]: startOfMonth }, status: { [Op.notIn]: ['cancelled'] } }
    }).catch(() => 0);

    const yearlySales = await Sale.sum('total_amount', {
      where: { sale_date: { [Op.gte]: startOfYear }, status: { [Op.notIn]: ['cancelled'] } }
    }).catch(() => 0);

    // Low stock products - fixed SQL query
    const lowStockResult = await sequelize.query(`
      SELECT COUNT(*) as count
      FROM (
        SELECT p.id
        FROM products p
        LEFT JOIN stocks s ON p.id = s.product_id
        WHERE p.is_active = true AND p.is_trackable = true
        GROUP BY p.id, p.min_stock_level
        HAVING COALESCE(SUM(s.quantity), 0) <= p.min_stock_level
      ) AS low_stock_products
    `, { type: sequelize.QueryTypes.SELECT });

    // Stock value
    const stockValueResult = await sequelize.query(`
      SELECT COALESCE(SUM(s.quantity * p.cost_price), 0) as total_value
      FROM stocks s
      INNER JOIN products p ON s.product_id = p.id
      WHERE p.is_active = true AND s.quantity > 0
    `, { type: sequelize.QueryTypes.SELECT });

    // Pending orders
    const pendingOrders = await PurchaseOrder.count({
      where: { status: { [Op.in]: ['pending', 'ordered'] } }
    }).catch(() => 0);

    // Recent movements (last 10)
    const recentMovements = await StockMovement.findAll({
      limit: 10,
      order: [['movement_date', 'DESC']],
      include: [
        { model: Product, as: 'product', attributes: ['id', 'name', 'sku'] },
        { model: Warehouse, as: 'warehouse', attributes: ['id', 'name'] }
      ]
    }).catch(() => []);

    // Low stock items with details
    const lowStockItems = await sequelize.query(`
      SELECT 
        p.id,
        p.name,
        p.sku,
        p.min_stock_level,
        COALESCE(SUM(s.quantity), 0) as total_quantity
      FROM products p
      LEFT JOIN stocks s ON p.id = s.product_id
      WHERE p.is_active = true AND p.is_trackable = true
      GROUP BY p.id, p.name, p.sku, p.min_stock_level
      HAVING COALESCE(SUM(s.quantity), 0) <= p.min_stock_level
      ORDER BY total_quantity ASC
      LIMIT 10
    `, { type: sequelize.QueryTypes.SELECT }).catch(() => []);

    console.log('✅ Stats calculated successfully:', {
      totalProducts,
      lowStock: lowStockResult[0]?.count,
      stockValue: stockValueResult[0]?.total_value,
      todaySales,
      monthlySales,
      recentMovementsCount: recentMovements.length,
      lowStockItemsCount: lowStockItems.length
    });

    res.json({
      success: true,
      data: {
        statistics: {
          totalProducts: totalProducts || 0,
          lowStockProducts: parseInt(lowStockResult[0]?.count || 0),
          totalCustomers: totalCustomers || 0,
          totalSuppliers: totalSuppliers || 0,
          pendingOrders: pendingOrders || 0,
          stockValue: parseFloat(stockValueResult[0]?.total_value || 0)
        },
        sales: {
          today: parseFloat(todaySales || 0),
          monthly: parseFloat(monthlySales || 0),
          yearly: parseFloat(yearlySales || 0)
        },
        recentMovements: recentMovements || [],
        lowStockItems: lowStockItems || []
      }
    });
  } catch (error) {
    console.error('❌ Dashboard stats error:', error.message);
    console.error('❌ Stack trace:', error.stack);
    next(error);
  }
};

// Get sales chart data
exports.getSalesChart = async (req, res, next) => {
  try {
    const { period = 'month' } = req.query; // day, week, month, year
    
    let dateFormat, dateFrom;
    const now = new Date();

    switch (period) {
      case 'day':
        dateFormat = '%Y-%m-%d %H:00:00';
        dateFrom = new Date(now.setDate(now.getDate() - 1));
        break;
      case 'week':
        dateFormat = '%Y-%m-%d';
        dateFrom = new Date(now.setDate(now.getDate() - 7));
        break;
      case 'year':
        dateFormat = '%Y-%m';
        dateFrom = new Date(now.setFullYear(now.getFullYear() - 1));
        break;
      default: // month
        dateFormat = '%Y-%m-%d';
        dateFrom = new Date(now.setDate(now.getDate() - 30));
    }

    const salesData = await sequelize.query(`
      SELECT 
        DATE_FORMAT(sale_date, '${dateFormat}') as date,
        COUNT(*) as count,
        SUM(total_amount) as total
      FROM sales
      WHERE sale_date >= :dateFrom
        AND status NOT IN ('cancelled')
      GROUP BY DATE_FORMAT(sale_date, '${dateFormat}')
      ORDER BY date ASC
    `, {
      replacements: { dateFrom },
      type: sequelize.QueryTypes.SELECT
    });

    res.json({
      success: true,
      data: salesData
    });
  } catch (error) {
    next(error);
  }
};

// Get top selling products
exports.getTopProducts = async (req, res, next) => {
  try {
    const { limit = 10, period = 'month' } = req.query;
    
    const now = new Date();
    let dateFrom;

    switch (period) {
      case 'week':
        dateFrom = new Date(now.setDate(now.getDate() - 7));
        break;
      case 'year':
        dateFrom = new Date(now.setFullYear(now.getFullYear() - 1));
        break;
      default: // month
        dateFrom = new Date(now.setDate(now.getDate() - 30));
    }

    const topProducts = await sequelize.query(`
      SELECT 
        p.id,
        p.name,
        p.sku,
        SUM(si.quantity) as total_sold,
        SUM(si.total_price) as total_revenue
      FROM sale_items si
      JOIN products p ON si.product_id = p.id
      JOIN sales s ON si.sale_id = s.id
      WHERE s.sale_date >= :dateFrom
        AND s.status NOT IN ('cancelled')
      GROUP BY p.id, p.name, p.sku
      ORDER BY total_sold DESC
      LIMIT :limit
    `, {
      replacements: { dateFrom, limit: parseInt(limit) },
      type: sequelize.QueryTypes.SELECT
    });

    res.json({
      success: true,
      data: topProducts
    });
  } catch (error) {
    next(error);
  }
};

// Get stock alerts
exports.getStockAlerts = async (req, res, next) => {
  try {
    // Low stock products
    const lowStock = await sequelize.query(`
      SELECT 
        p.id,
        p.name,
        p.sku,
        p.min_stock_level,
        SUM(s.quantity) as current_stock
      FROM products p
      LEFT JOIN stocks s ON p.id = s.product_id
      WHERE p.is_active = true AND p.is_trackable = true
      GROUP BY p.id
      HAVING current_stock <= p.min_stock_level
      ORDER BY current_stock ASC
      LIMIT 20
    `, { type: sequelize.QueryTypes.SELECT });

    // Out of stock products
    const outOfStock = await sequelize.query(`
      SELECT 
        p.id,
        p.name,
        p.sku
      FROM products p
      LEFT JOIN stocks s ON p.id = s.product_id
      WHERE p.is_active = true AND p.is_trackable = true
      GROUP BY p.id
      HAVING COALESCE(SUM(s.quantity), 0) = 0
      LIMIT 20
    `, { type: sequelize.QueryTypes.SELECT });

    res.json({
      success: true,
      data: {
        lowStock,
        outOfStock
      }
    });
  } catch (error) {
    next(error);
  }
};

