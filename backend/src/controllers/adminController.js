const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Product');

// @desc    Get dashboard stats
// @route   GET /api/admin/dashboard
// @access  Private/Admin
exports.getDashboardStats = async (req, res) => {
    try {
        // 1. Total Revenue
        const revenueResult = await Order.aggregate([
            { $match: { status: 'Completed' } },
            { $group: { _id: null, total: { $sum: '$total_price' } } }
        ]);
        const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

        // 2. Total Users
        const totalUsers = await User.countDocuments({ role: 'customer' });

        // 3. Total Orders
        const totalOrders = await Order.countDocuments();

        // 4. Total Products
        const totalProducts = await Product.countDocuments();

        res.status(200).json({
            success: true,
            data: {
                totalRevenue,
                totalUsers,
                totalOrders,
                totalProducts
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Get all orders
// @route   GET /api/admin/orders
// @access  Private/Admin
exports.getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find()
            .populate('user_id', 'full_name email')
            .sort({ created_at: -1 });

        const data = orders.map(o => {
            const obj = o.toObject();
            obj.user_name = obj.user_id ? obj.user_id.full_name : null;
            obj.user_email = obj.user_id ? obj.user_id.email : null;
            return obj;
        });

        res.status(200).json({
            success: true,
            data
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Update order status
// @route   PUT /api/admin/orders/:id/status
// @access  Private/Admin
exports.updateOrderStatus = async (req, res) => {
    const { status } = req.body;
    try {
        await Order.findByIdAndUpdate(req.params.id, { status });
        res.status(200).json({ success: true, message: 'Order status updated' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find({ role: 'customer' })
            .select('full_name email role phone address is_banned created_at')
            .sort({ created_at: -1 });

        res.status(200).json({
            success: true,
            data: users
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Toggle user ban status
// @route   PUT /api/admin/users/:id/ban
// @access  Private/Admin
exports.toggleUserBan = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const newBanStatus = !user.is_banned;
        user.is_banned = newBanStatus;
        await user.save();

        res.status(200).json({
            success: true,
            message: newBanStatus ? 'User banned' : 'User unbanned',
            is_banned: newBanStatus
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
