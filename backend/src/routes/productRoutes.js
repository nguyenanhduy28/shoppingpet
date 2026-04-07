const express = require('express');
const router = express.Router();
const { getProducts, getProduct, getCategories, getLatestProducts, createProduct, updateProduct, deleteProduct } = require('../controllers/productController');
const { protect, isAdmin } = require('../middlewares/authMiddleware');

router.get('/', getProducts);
router.get('/latest', getLatestProducts);
router.get('/categories', getCategories);
router.get('/:id', getProduct);

// Admin routes
router.post('/', protect, isAdmin, createProduct);
router.put('/:id', protect, isAdmin, updateProduct);
router.delete('/:id', protect, isAdmin, deleteProduct);

module.exports = router;
