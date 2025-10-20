const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Supplier = sequelize.define('Supplier', {
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
  contact_person: {
    type: DataTypes.STRING(100)
  },
  email: {
    type: DataTypes.STRING(100),
    validate: {
      isEmail: {
        msg: 'Geçerli bir email adresi giriniz'
      }
    },
    set(value) {
      // Boş string gelirse null olarak kaydet
      this.setDataValue('email', value === '' ? null : value);
    }
  },
  phone: {
    type: DataTypes.STRING(20)
  },
  mobile: {
    type: DataTypes.STRING(20)
  },
  fax: {
    type: DataTypes.STRING(20)
  },
  website: {
    type: DataTypes.STRING(100)
  },
  tax_office: {
    type: DataTypes.STRING(100)
  },
  tax_number: {
    type: DataTypes.STRING(20)
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
  postal_code: {
    type: DataTypes.STRING(20)
  },
  payment_term: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Vade süresi (gün)'
  },
  credit_limit: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0
  },
  discount_rate: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0
  },
  currency: {
    type: DataTypes.ENUM('TRY', 'USD', 'EUR', 'GBP'),
    defaultValue: 'TRY'
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  notes: {
    type: DataTypes.TEXT
  },
  rating: {
    type: DataTypes.DECIMAL(3, 2),
    defaultValue: 0,
    validate: {
      min: 0,
      max: 5
    }
  }
}, {
  tableName: 'suppliers',
  timestamps: true
});

module.exports = Supplier;

