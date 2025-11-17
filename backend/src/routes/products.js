const express = require('express');
const router = express.Router();
const { 
  getAllProducts, 
  getProductById, 
  createProduct, 
  updateProduct, 
  deleteProduct 
} = require('../controllers/productController');
const { validateProduct, validateId } = require('../middleware/validation');

// GET /api/products - Get all products with features (with pagination, search, sorting)
router.get('/', getAllProducts);

// GET /api/products/:id - Get single product by ID
router.get('/:id', validateId, getProductById);

// POST /api/products - Create new product
router.post('/', validateProduct, createProduct);

// PUT /api/products/:id - Update product
router.put('/:id', validateId, validateProduct, updateProduct);

// DELETE /api/products/:id - Delete product
router.delete('/:id', validateId, deleteProduct);

module.exports = router;
