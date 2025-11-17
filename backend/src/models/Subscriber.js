const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Subscriber = sequelize.define('Subscriber', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'id'
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
    field: 'EMAIL',
    validate: {
      isEmail: true,
      notEmpty: true
    }
  },
  subscribedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'SUBSCRIBED_AT'
  }
}, {
  tableName: 'SUBSCRIBERS',
  timestamps: false, // We're using the custom SUBSCRIBED_AT field
  indexes: [
    {
      unique: true,
      fields: ['EMAIL']
    },
    {
      fields: ['SUBSCRIBED_AT']
    }
  ]
});

module.exports = Subscriber;

