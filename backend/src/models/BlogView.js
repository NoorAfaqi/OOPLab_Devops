const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const BlogView = sequelize.define('BlogView', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'id'
  },
  blogId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'blog_id',
    references: {
      model: 'blogs',
      key: 'id'
    }
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'user_id',
    references: {
      model: 'users',
      key: 'id'
    }
  },
  ipAddress: {
    type: DataTypes.STRING(45),
    allowNull: true,
    field: 'ip_address'
  },
  userAgent: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'user_agent'
  },
  referrer: {
    type: DataTypes.STRING(500),
    allowNull: true,
    field: 'referrer'
  },
  country: {
    type: DataTypes.STRING(100),
    allowNull: true,
    field: 'country'
  },
  city: {
    type: DataTypes.STRING(100),
    allowNull: true,
    field: 'city'
  },
  deviceType: {
    type: DataTypes.STRING(50),
    allowNull: true,
    field: 'device_type'
  },
  browser: {
    type: DataTypes.STRING(50),
    allowNull: true,
    field: 'browser'
  },
  os: {
    type: DataTypes.STRING(50),
    allowNull: true,
    field: 'os'
  },
  sessionId: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'session_id'
  }
}, {
  tableName: 'blog_views',
  timestamps: true,
  indexes: [
    {
      fields: ['blog_id']
    },
    {
      fields: ['user_id']
    },
    {
      fields: ['ip_address']
    },
    {
      fields: ['created_at']
    },
    {
      fields: ['session_id']
    },
    {
      fields: ['blog_id', 'created_at']
    }
  ]
});

// Instance methods
BlogView.prototype.parseUserAgent = function() {
  if (!this.userAgent) return;
  
  // Simple parsing - in production, use a library like 'ua-parser-js'
  if (this.userAgent.includes('Mobile')) this.deviceType = 'Mobile';
  else if (this.userAgent.includes('Tablet')) this.deviceType = 'Tablet';
  else this.deviceType = 'Desktop';
  
  if (this.userAgent.includes('Chrome')) this.browser = 'Chrome';
  else if (this.userAgent.includes('Firefox')) this.browser = 'Firefox';
  else if (this.userAgent.includes('Safari')) this.browser = 'Safari';
  else if (this.userAgent.includes('Edge')) this.browser = 'Edge';
  else this.browser = 'Other';
  
  if (this.userAgent.includes('Windows')) this.os = 'Windows';
  else if (this.userAgent.includes('Mac')) this.os = 'macOS';
  else if (this.userAgent.includes('Linux')) this.os = 'Linux';
  else if (this.userAgent.includes('Android')) this.os = 'Android';
  else if (this.userAgent.includes('iOS')) this.os = 'iOS';
  else this.os = 'Other';
};

BlogView.prototype.toJSON = function() {
  const values = Object.assign({}, this.get());
  return values;
};

module.exports = BlogView;
