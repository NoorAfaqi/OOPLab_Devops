const { sequelize } = require('../config/database');

// Import all models
const Product = require('./Product');
const P_Features = require('./P_Features');
const User = require('./User');
const Blog = require('./Blog');
const Comment = require('./Comment');
const BlogLike = require('./BlogLike');
const BlogAnalytics = require('./BlogAnalytics');
const BlogView = require('./BlogView');
const Subscriber = require('./Subscriber');
const Contact = require('./Contact');

// Define associations
const defineAssociations = () => {
  // Product has many Features
  Product.hasMany(P_Features, { 
    foreignKey: 'PID', 
    as: 'features',
    sourceKey: 'PID'
  });

  // Feature belongs to Product
  P_Features.belongsTo(Product, { 
    foreignKey: 'PID', 
    as: 'product',
    targetKey: 'PID'
  });

  // User associations
  User.hasMany(Blog, { 
    foreignKey: 'authorId', 
    as: 'blogs',
    sourceKey: 'id'
  });

  User.hasMany(Comment, { 
    foreignKey: 'userId', 
    as: 'comments',
    sourceKey: 'id'
  });

  User.hasMany(BlogLike, { 
    foreignKey: 'userId', 
    as: 'blogLikes',
    sourceKey: 'id'
  });

  // Blog associations
  Blog.belongsTo(User, { 
    foreignKey: 'authorId', 
    as: 'author',
    targetKey: 'id'
  });

  Blog.hasMany(Comment, { 
    foreignKey: 'blogId', 
    as: 'comments',
    sourceKey: 'id'
  });

  Blog.hasMany(BlogLike, { 
    foreignKey: 'blogId', 
    as: 'likes',
    sourceKey: 'id'
  });

  // Comment associations
  Comment.belongsTo(User, { 
    foreignKey: 'userId', 
    as: 'author',
    targetKey: 'id'
  });

  Comment.belongsTo(Blog, { 
    foreignKey: 'blogId', 
    as: 'blog',
    targetKey: 'id'
  });

  Comment.belongsTo(Comment, { 
    foreignKey: 'parentId', 
    as: 'parent',
    targetKey: 'id'
  });

  Comment.hasMany(Comment, { 
    foreignKey: 'parentId', 
    as: 'replies',
    sourceKey: 'id'
  });

  // BlogLike associations
  BlogLike.belongsTo(User, { 
    foreignKey: 'userId', 
    as: 'user',
    targetKey: 'id'
  });

  BlogLike.belongsTo(Blog, { 
    foreignKey: 'blogId', 
    as: 'blog',
    targetKey: 'id'
  });

  // BlogAnalytics associations
  BlogAnalytics.belongsTo(Blog, { 
    foreignKey: 'blogId', 
    as: 'blog',
    targetKey: 'id'
  });

  Blog.hasOne(BlogAnalytics, { 
    foreignKey: 'blogId', 
    as: 'analytics',
    sourceKey: 'id'
  });

  // BlogView associations
  BlogView.belongsTo(Blog, { 
    foreignKey: 'blogId', 
    as: 'blog',
    targetKey: 'id'
  });

  BlogView.belongsTo(User, { 
    foreignKey: 'userId', 
    as: 'user',
    targetKey: 'id'
  });

  Blog.hasMany(BlogView, { 
    foreignKey: 'blogId', 
    as: 'views',
    sourceKey: 'id'
  });

  User.hasMany(BlogView, { 
    foreignKey: 'userId', 
    as: 'blogViews',
    sourceKey: 'id'
  });
};

// Initialize associations
defineAssociations();

// Export models and sequelize instance
module.exports = {
  sequelize,
  Product,
  P_Features,
  User,
  Blog,
  Comment,
  BlogLike,
  BlogAnalytics,
  BlogView,
  Subscriber,
  Contact
};
