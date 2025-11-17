const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const P_Features = sequelize.define('P_Features', {
  FID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'FID'
  },
  PID: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'PID',
    references: {
      model: 'PRODUCTS',
      key: 'PID'
    }
  },
  DESCRIPTION: {
    type: DataTypes.STRING(500),
    allowNull: false,
    field: 'DESCRIPTION'
  }
}, {
  tableName: 'P_FEATURES',
  timestamps: false, // Since you didn't mention created_at/updated_at fields
  indexes: [
    {
      fields: ['PID']
    }
  ]
});

module.exports = P_Features;
