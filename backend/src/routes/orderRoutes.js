const express = require('express');
const router = express.Router();
const { createOrder, getMyOrders, getOrderDetails } = require('../controllers/orderController');
const { protect } = require('../middlewares/auth');

router.use(protect); // All order routes need authentication

router.post('/', createOrder);
router.get('/', getMyOrders);
router.get('/:id', getOrderDetails);

module.exports = router;
