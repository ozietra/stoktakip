const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  sku: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  barcode: {
    type: DataTypes.STRING(100),
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
  category_id: {
    type: DataTypes.INTEGER,
    references: {
      model: 'categories',
      key: 'id'
    }
  },
  unit_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'units',
      key: 'id'
    }
  },
  cost_price: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0
  },
  sale_price: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0
  },
  tax_rate: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0
  },
  min_stock_level: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0
  },
  max_stock_level: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0
  },
  reorder_point: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0
  },
  reorder_quantity: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0
  },
  image: {
    type: DataTypes.STRING(255)
  },
  images: {
    type: DataTypes.JSON
  },
  brand: {
    type: DataTypes.STRING(100)
  },
  model: {
    type: DataTypes.STRING(100)
  },
  weight: {
    type: DataTypes.DECIMAL(10, 3)
  },
  dimensions: {
    type: DataTypes.STRING(100)
  },
  color: {
    type: DataTypes.STRING(50)
  },
  size: {
    type: DataTypes.STRING(50)
  },
  warranty_period: {
    type: DataTypes.INTEGER
  },
  expiry_days: {
    type: DataTypes.INTEGER
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  is_trackable: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  notes: {
    type: DataTypes.TEXT
  },
  created_by: {
    type: DataTypes.INTEGER,
    references: {
      model: 'users',
      key: 'id'
    }
  }
}, {
  tableName: 'products',
  timestamps: true
});

module.exports = Product;

