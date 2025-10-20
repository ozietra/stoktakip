const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Customer = sequelize.define('Customer', {
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
  type: {
    type: DataTypes.ENUM('individual', 'corporate'),
    defaultValue: 'individual'
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
  tax_office: {
    type: DataTypes.STRING(100)
  },
  tax_number: {
    type: DataTypes.STRING(20)
  },
  identity_number: {
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
  price_group: {
    type: DataTypes.ENUM('standard', 'wholesale', 'vip', 'special'),
    defaultValue: 'standard'
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
  birth_date: {
    type: DataTypes.DATEONLY
  },
  registration_date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'customers',
  timestamps: true
});

module.exports = Customer;

