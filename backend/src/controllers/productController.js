const { Product, P_Features } = require('../models');
const { logger } = require('../middleware/errorHandler');
const { Op } = require('sequelize');

const getAllProducts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      sortBy = 'PID',
      sortOrder = 'ASC'
    } = req.query;

    const offset = (page - 1) * limit;
    const whereClause = {};

    // Add search filter
    if (search) {
      whereClause[Op.or] = [
        { NAME: { [Op.like]: `%${search}%` } },
        { DESCRIPTION: { [Op.like]: `%${search}%` } }
      ];
    }

    const { count, rows: products } = await Product.findAndCountAll({
      where: whereClause,
      order: [[sortBy, sortOrder.toUpperCase()]],
      limit: parseInt(limit),
      offset: parseInt(offset),
      include: [
        {
          model: P_Features,
          as: 'features',
          attributes: ['FID', 'DESCRIPTION']
        }
      ]
    });

    const totalPages = Math.ceil(count / limit);

    res.json({
      success: true,
      data: {
        products,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalItems: count,
          itemsPerPage: parseInt(limit),
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      }
    });
  } catch (error) {
    logger.error('Get products error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch products',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findByPk(id, {
      include: [
        {
          model: P_Features,
          as: 'features',
          attributes: ['FID', 'DESCRIPTION']
        }
      ]
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      data: { product }
    });
  } catch (error) {
    logger.error('Get product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch product',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

const createProduct = async (req, res) => {
  try {
    const { NAME, P_URL, DESCRIPTION, LOGO, features } = req.body;
    
    // Check if product with same name already exists
    const existingProduct = await Product.findOne({ where: { NAME } });
    if (existingProduct) {
      return res.status(400).json({
        success: false,
        message: 'A product with this name already exists'
      });
    }

    const product = await Product.create({
      NAME,
      P_URL,
      DESCRIPTION,
      LOGO
    });

    // Add features if provided
    if (features && features.length > 0) {
      const featureData = features.map(feature => ({
        PID: product.PID,
        DESCRIPTION: feature.DESCRIPTION
      }));
      await P_Features.bulkCreate(featureData);
    }

    logger.info(`New product created: ${product.NAME}`);

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: { product }
    });
  } catch (error) {
    logger.error('Create product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create product',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { NAME, P_URL, DESCRIPTION, LOGO, features } = req.body;

    const product = await Product.findByPk(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check if name is being changed and already exists
    if (NAME && NAME !== product.NAME) {
      const existingProduct = await Product.findOne({ 
        where: { NAME, PID: { [Op.ne]: id } } 
      });
      
      if (existingProduct) {
        return res.status(400).json({
          success: false,
          message: 'A product with this name already exists'
        });
      }
    }

    await product.update({
      NAME: NAME || product.NAME,
      P_URL: P_URL || product.P_URL,
      DESCRIPTION: DESCRIPTION || product.DESCRIPTION,
      LOGO: LOGO || product.LOGO
    });

    // Update features if provided
    if (features) {
      // Delete existing features
      await P_Features.destroy({ where: { PID: id } });
      
      // Add new features
      if (features.length > 0) {
        const featureData = features.map(feature => ({
          PID: id,
          DESCRIPTION: feature.DESCRIPTION
        }));
        await P_Features.bulkCreate(featureData);
      }
    }

    logger.info(`Product updated: ${product.NAME}`);

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: { product }
    });
  } catch (error) {
    logger.error('Update product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update product',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findByPk(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Delete associated features first
    await P_Features.destroy({ where: { PID: id } });
    
    // Delete product
    await product.destroy();

    logger.info(`Product deleted: ${product.NAME}`);

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    logger.error('Delete product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete product',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
};
