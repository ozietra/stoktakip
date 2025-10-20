const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Stock = sequelize.define('Stock', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  product_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'products',
      key: 'id'
    }
  },
  warehouse_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'warehouses',
      key: 'id'
    }
  },
  location_id: {
    type: DataTypes.INTEGER,
    references: {
      model: 'locations',
      key: 'id'
    }
  },
  quantity: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0
  },
  reserved_quantity: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0
  },
  available_quantity: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0
  },
  average_cost: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0
  },
  last_purchase_price: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0
  },
  last_purchase_date: {
    type: DataTypes.DATE
  }
}, {
  tableName: 'stocks',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['product_id', 'warehouse_id', 'location_id']
    }
  ]
});

module.exports = Stock;

