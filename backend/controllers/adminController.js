const { sql } = require('../config/db');

// @desc    Get dashboard stats
// @route   GET /api/admin/dashboard
// @access  Private/Admin
exports.getDashboardStats = async (req, res) => {
    try {
        const pool = await sql.connect();
        
        // 1. Total Revenue
        const revenueResult = await pool.request().query('SELECT SUM(total_price) as total FROM Orders WHERE status = \'Completed\'');
        const totalRevenue = revenueResult.recordset[0].total || 0;

        // 2. Total Users
        const usersResult = await pool.request().query('SELECT COUNT(*) as total FROM Users WHERE role = \'customer\'');
        const totalUsers = usersResult.recordset[0].total;

        // 3. Total Orders
        const ordersResult = await pool.request().query('SELECT COUNT(*) as total FROM Orders');
        const totalOrders = ordersResult.recordset[0].total;

        // 4. Total Products
        const productsResult = await pool.request().query('SELECT COUNT(*) as total FROM Products');
        const totalProducts = productsResult.recordset[0].total;

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
        const pool = await sql.connect();
        const result = await pool.request().query(`
            SELECT o.*, u.full_name as user_name, u.email as user_email
            FROM Orders o
            JOIN Users u ON o.user_id = u.id
            ORDER BY o.created_at DESC
        `);

        res.status(200).json({
            success: true,
            data: result.recordset
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
        const pool = await sql.connect();
        await pool.request()
            .input('id', sql.Int, req.params.id)
            .input('status', sql.NVarChar, status)
            .query('UPDATE Orders SET status = @status, updated_at = GETDATE() WHERE id = @id');

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
        const pool = await sql.connect();
        const result = await pool.request().query('SELECT id, full_name, email, role, phone, address, is_banned, created_at FROM Users WHERE role = \'customer\' ORDER BY created_at DESC');

        res.status(200).json({
            success: true,
            data: result.recordset
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
        const pool = await sql.connect();
        const userResult = await pool.request()
            .input('id', sql.Int, req.params.id)
            .query('SELECT is_banned FROM Users WHERE id = @id');

        if (userResult.recordset.length === 0) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const newBanStatus = userResult.recordset[0].is_banned ? 0 : 1;

        await pool.request()
            .input('id', sql.Int, req.params.id)
            .input('is_banned', sql.Bit, newBanStatus)
            .query('UPDATE Users SET is_banned = @is_banned WHERE id = @id');

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
