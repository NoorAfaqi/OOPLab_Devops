const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Contact = sequelize.define('Contact', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'id'
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false,
    field: 'name',
    validate: {
      notEmpty: true,
      len: [2, 255]
    }
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    field: 'email',
    validate: {
      isEmail: true,
      notEmpty: true
    }
  },
  company: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'company',
    validate: {
      len: [2, 255]
    }
  },
  subject: {
    type: DataTypes.STRING(255),
    allowNull: false,
    field: 'subject',
    validate: {
      notEmpty: true,
      len: [2, 255]
    }
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false,
    field: 'message',
    validate: {
      notEmpty: true,
      len: [10, 5000]
    }
  },
  status: {
    type: DataTypes.ENUM('pending', 'read', 'replied', 'archived'),
    defaultValue: 'pending',
    field: 'status'
  },
  repliedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'replied_at'
  }
}, {
  tableName: 'contacts',
  timestamps: true,
  indexes: [
    {
      fields: ['email']
    },
    {
      fields: ['status']
    },
    {
      fields: ['created_at']
    }
  ]
});

module.exports = Contact;

