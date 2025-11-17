const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Product = sequelize.define('Product', {
  PID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'PID'
  },
  NAME: {
    type: DataTypes.STRING(255),
    allowNull: false,
    field: 'NAME'
  },
  P_URL: {
    type: DataTypes.STRING(500),
    allowNull: false,
    field: 'P_URL'
  },
  DESCRIPTION: {
    type: DataTypes.TEXT,
    allowNull: false,
    field: 'DESCRIPTION'
  },
  LOGO: {
    type: DataTypes.STRING(500),
    allowNull: true,
    field: 'LOGO'
  }
}, {
  tableName: 'PRODUCTS',
  timestamps: false, // Since you didn't mention created_at/updated_at fields
  indexes: [
    {
      fields: ['NAME']
    },
    {
      fields: ['P_URL']
    }
  ]
});

module.exports = Product;
