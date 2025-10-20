const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Sale = sequelize.define('Sale', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  sale_number: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  customer_id: {
    type: DataTypes.INTEGER,
    references: {
      model: 'customers',
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
  sale_date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  status: {
    type: DataTypes.ENUM('draft', 'pending', 'confirmed', 'shipped', 'delivered', 'cancelled', 'returned'),
    defaultValue: 'confirmed'
  },
  subtotal: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0
  },
  tax_amount: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0
  },
  discount_amount: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0
  },
  shipping_cost: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0
  },
  total_amount: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0
  },
  currency: {
    type: DataTypes.ENUM('TRY', 'USD', 'EUR', 'GBP'),
    defaultValue: 'TRY'
  },
  exchange_rate: {
    type: DataTypes.DECIMAL(10, 4),
    defaultValue: 1
  },
  payment_method: {
    type: DataTypes.ENUM('cash', 'credit_card', 'bank_transfer', 'check', 'other'),
    defaultValue: 'cash'
  },
  payment_status: {
    type: DataTypes.ENUM('unpaid', 'partially_paid', 'paid'),
    defaultValue: 'unpaid'
  },
  campaign_id: {
    type: DataTypes.INTEGER,
    references: {
      model: 'campaigns',
      key: 'id'
    }
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
  }
}, {
  tableName: 'sales',
  timestamps: true,
  hooks: {
    beforeValidate: async (sale) => {
      if (!sale.sale_number) {
        // Generate unique sale number with timestamp to avoid duplicates
        const date = new Date();
        const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
        const timeStr = date.getTime().toString().slice(-6); // Last 6 digits of timestamp
        const random = Math.floor(Math.random() * 100).toString().padStart(2, '0');
        
        sale.sale_number = `SAL-${dateStr}-${timeStr}${random}`;
      }
    }
  }
});

module.exports = Sale;

