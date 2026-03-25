const express = require('express');
const router = express.Router();
const { getDashboardStats, getAllOrders, updateOrderStatus, getAllUsers, toggleUserBan } = require('../controllers/adminController');
const { protect, isAdmin } = require('../middlewares/authMiddleware');

router.use(protect);
router.use(isAdmin);

router.get('/dashboard', getDashboardStats);
router.get('/orders', getAllOrders);
router.put('/orders/:id/status', updateOrderStatus);
router.get('/users', getAllUsers);
router.put('/users/:id/ban', toggleUserBan);

module.exports = router;
