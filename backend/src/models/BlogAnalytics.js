const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const { Op } = require('sequelize');

const BlogAnalytics = sequelize.define('BlogAnalytics', {
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
  totalViews: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'view_count'
  },
  uniqueViews: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'unique_view_count'
  },
  referralData: {
    type: DataTypes.JSON,
    allowNull: true,
    field: 'referral_data',
    defaultValue: {}
  },
  deviceData: {
    type: DataTypes.JSON,
    allowNull: true,
    field: 'device_data',
    defaultValue: {}
  },
  locationData: {
    type: DataTypes.JSON,
    allowNull: true,
    field: 'location_data',
    defaultValue: {}
  },
  lastViewedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'last_viewed_at'
  }
}, {
  tableName: 'blog_analytics',
  timestamps: true,
  indexes: [
    {
      fields: ['blog_id']
    },
    {
      fields: ['last_viewed_at']
    },
    {
      fields: ['created_at']
    }
  ]
});

// Instance methods
BlogAnalytics.prototype.incrementView = async function(userAgent, referrer, ipAddress) {
  this.totalViews += 1;
  this.lastViewedAt = new Date();

  // Update unique views (simple IP-based uniqueness for demonstration)
  // In a real app, you might use a more robust method (e.g., session-based, cookie-based)
  const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
  const existingView = await sequelize.models.BlogView.findOne({
    where: {
      blogId: this.blogId,
      ipAddress: ipAddress,
      createdAt: { [Op.gte]: thirtyMinutesAgo }
    }
  });

  if (!existingView) {
    this.uniqueViews += 1;
  }

  // Update referral data
  if (referrer) {
    const domain = this.extractDomain(referrer);
    if (domain) {
      this.referralData = this.referralData || {};
      this.referralData[domain] = (this.referralData[domain] || 0) + 1;
    }
  }

  // Update device data
  this.deviceData = this.deviceData || {};
  const deviceInfo = this.parseUserAgent(userAgent);
  this.deviceData[deviceInfo] = (this.deviceData[deviceInfo] || 0) + 1;

  return this.save();
};

BlogAnalytics.prototype.extractDomain = function(url) {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch (e) {
    return null;
  }
};

BlogAnalytics.prototype.parseUserAgent = function(userAgent) {
  if (!userAgent) return 'Unknown';
  
  // Simple device detection
  if (userAgent.includes('Mobile')) return 'Mobile';
  if (userAgent.includes('Tablet')) return 'Tablet';
  if (userAgent.includes('Desktop')) return 'Desktop';
  
  // Browser detection
  if (userAgent.includes('Chrome')) return 'Chrome';
  if (userAgent.includes('Firefox')) return 'Firefox';
  if (userAgent.includes('Safari')) return 'Safari';
  if (userAgent.includes('Edge')) return 'Edge';
  
  return 'Other';
};

BlogAnalytics.prototype.toJSON = function() {
  const values = Object.assign({}, this.get());
  return values;
};

module.exports = BlogAnalytics;
