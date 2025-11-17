const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Blog = sequelize.define('Blog', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'id'
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false,
    field: 'title',
    validate: {
      notEmpty: true,
      len: [1, 255]
    }
  },
  slug: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
    field: 'slug',
    validate: {
      notEmpty: true,
      len: [1, 255],
      is: /^[a-z0-9-]+$/i // Only alphanumeric and hyphens
    }
  },
  content: {
    type: DataTypes.TEXT('long'),
    allowNull: false,
    field: 'content',
    validate: {
      notEmpty: true
    }
  },
  authorId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'author_id',
    references: {
      model: 'users',
      key: 'id'
    }
  },
  coverImage: {
    type: DataTypes.STRING(500),
    allowNull: true,
    field: 'cover_image',
    validate: {
      isUrl: true
    }
  },
  published: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'published'
  }
}, {
  tableName: 'blogs',
  timestamps: true,
  indexes: [
    {
      fields: ['author_id']
    },
    {
      fields: ['slug']
    },
    {
      fields: ['published']
    },
    {
      fields: ['created_at']
    },
    {
      fields: ['title']
    }
  ]
});

// Instance methods
Blog.prototype.generateSlug = function() {
  const baseSlug = this.title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .trim('-'); // Remove leading/trailing hyphens
  
  return baseSlug;
};

Blog.prototype.toJSON = function() {
  const values = Object.assign({}, this.get());
  return values;
};

module.exports = Blog;
