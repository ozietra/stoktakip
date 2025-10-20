const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Campaign = sequelize.define('Campaign', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  code: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  name: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  name_en: {
    type: DataTypes.STRING(200)
  },
  description: {
    type: DataTypes.TEXT
  },
  description_en: {
    type: DataTypes.TEXT
  },
  type: {
    type: DataTypes.ENUM('percentage', 'fixed_amount', 'buy_x_get_y', 'free_shipping'),
    allowNull: false
  },
  discount_value: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0
  },
  min_purchase_amount: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0
  },
  max_discount_amount: {
    type: DataTypes.DECIMAL(15, 2)
  },
  start_date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  end_date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  usage_limit: {
    type: DataTypes.INTEGER
  },
  usage_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  applicable_to: {
    type: DataTypes.ENUM('all', 'specific_products', 'specific_categories', 'specific_customers'),
    defaultValue: 'all'
  },
  target_ids: {
    type: DataTypes.JSON,
    comment: 'Array of product/category/customer IDs'
  },
  created_by: {
    type: DataTypes.INTEGER,
    references: {
      model: 'users',
      key: 'id'
    }
  }
}, {
  tableName: 'campaigns',
  timestamps: true
});

module.exports = Campaign;

