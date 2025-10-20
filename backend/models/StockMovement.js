const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const StockMovement = sequelize.define('StockMovement', {
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
  type: {
    type: DataTypes.ENUM('in', 'out', 'transfer', 'adjustment', 'return', 'loss', 'production'),
    allowNull: false
  },
  quantity: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false
  },
  unit_price: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0
  },
  total_price: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0
  },
  reference_type: {
    type: DataTypes.ENUM('purchase_order', 'sale', 'transfer', 'manual', 'other'),
    defaultValue: 'manual'
  },
  reference_id: {
    type: DataTypes.INTEGER
  },
  reference_number: {
    type: DataTypes.STRING(50)
  },
  from_warehouse_id: {
    type: DataTypes.INTEGER,
    references: {
      model: 'warehouses',
      key: 'id'
    },
    comment: 'For transfer movements'
  },
  to_warehouse_id: {
    type: DataTypes.INTEGER,
    references: {
      model: 'warehouses',
      key: 'id'
    },
    comment: 'For transfer movements'
  },
  batch_number: {
    type: DataTypes.STRING(100)
  },
  serial_number: {
    type: DataTypes.STRING(100)
  },
  expiry_date: {
    type: DataTypes.DATEONLY
  },
  notes: {
    type: DataTypes.TEXT
  },
  created_by: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  movement_date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'stock_movements',
  timestamps: true
});

module.exports = StockMovement;

