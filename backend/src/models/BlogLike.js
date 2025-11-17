const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const BlogLike = sequelize.define('BlogLike', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
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
    allowNull: false,
    field: 'user_id',
    references: {
      model: 'users',
      key: 'id'
    }
  }
}, {
  tableName: 'blog_likes',
  timestamps: true,
  updatedAt: false,
  createdAt: 'created_at',
  underscored: true, // Use snake_case for database columns
  indexes: [
    {
      unique: true,
      fields: ['blog_id', 'user_id'],
      name: 'unique_blog_user_like'
    },
    {
      fields: ['blog_id']
    },
    {
      fields: ['user_id']
    }
  ]
});

module.exports = BlogLike;
