const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Location = sequelize.define('Location', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  warehouse_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'warehouses',
      key: 'id'
    }
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  code: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  aisle: {
    type: DataTypes.STRING(20)
  },
  rack: {
    type: DataTypes.STRING(20)
  },
  shelf: {
    type: DataTypes.STRING(20)
  },
  bin: {
    type: DataTypes.STRING(20)
  },
  description: {
    type: DataTypes.TEXT
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'locations',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['warehouse_id', 'code']
    }
  ]
});

module.exports = Location;

