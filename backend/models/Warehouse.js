const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Warehouse = sequelize.define('Warehouse', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  code: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true
  },
  description: {
    type: DataTypes.TEXT
  },
  address: {
    type: DataTypes.TEXT
  },
  city: {
    type: DataTypes.STRING(50)
  },
  country: {
    type: DataTypes.STRING(50),
    defaultValue: 'Türkiye'
  },
  phone: {
    type: DataTypes.STRING(20)
  },
  manager_name: {
    type: DataTypes.STRING(100)
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  is_main: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'warehouses',
  timestamps: true
});

module.exports = Warehouse;

