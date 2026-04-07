const express = require('express');
const router = express.Router();
const { getCart, addToCart, updateCartItem, removeFromCart } = require('../controllers/cartController');
const { protect } = require('../middlewares/auth');

router.use(protect); // All cart routes need authentication

router.get('/', getCart);
router.post('/', addToCart);
router.put('/:id', updateCartItem);
router.delete('/:id', removeFromCart);

module.exports = router;
