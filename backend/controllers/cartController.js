const { sql } = require('../config/db');

// @desc    Get current user's cart
// @route   GET /api/cart
// @access  Private
exports.getCart = async (req, res) => {
    try {
        const pool = await sql.connect();
        const result = await pool.request()
            .input('userId', sql.Int, req.user.id)
            .query(`
                SELECT c.id as cart_id, c.product_id, c.quantity, 
                       p.name, p.price, p.image_url, p.stock,
                       (c.quantity * p.price) as subtotal
                FROM Carts c
                JOIN Products p ON c.product_id = p.id
                WHERE c.user_id = @userId
            `);

        res.status(200).json({
            success: true,
            data: result.recordset
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Add product to cart
// @route   POST /api/cart
// @access  Private
exports.addToCart = async (req, res) => {
    const { product_id, quantity } = req.body;

    try {
        const pool = await sql.connect();
        
        // 1. Check if item already exists in cart
        const existingItem = await pool.request()
            .input('userId', sql.Int, req.user.id)
            .input('productId', sql.Int, product_id)
            .query('SELECT * FROM Carts WHERE user_id = @userId AND product_id = @productId');

        if (existingItem.recordset.length > 0) {
            // Update quantity
            await pool.request()
                .input('cartId', sql.Int, existingItem.recordset[0].id)
                .input('quantity', sql.Int, existingItem.recordset[0].quantity + (quantity || 1))
                .query('UPDATE Carts SET quantity = @quantity, updated_at = GETDATE() WHERE id = @cartId');
        } else {
            // Insert new item
            await pool.request()
                .input('userId', sql.Int, req.user.id)
                .input('productId', sql.Int, product_id)
                .input('quantity', sql.Int, quantity || 1)
                .query('INSERT INTO Carts (user_id, product_id, quantity) VALUES (@userId, @productId, @quantity)');
        }

        res.status(200).json({ success: true, message: 'Item added to cart' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Update cart item quantity
// @route   PUT /api/cart/:id
// @access  Private
exports.updateCartItem = async (req, res) => {
    const { quantity } = req.body;

    try {
        const pool = await sql.connect();
        await pool.request()
            .input('cartId', sql.Int, req.params.id)
            .input('userId', sql.Int, req.user.id)
            .input('quantity', sql.Int, quantity)
            .query('UPDATE Carts SET quantity = @quantity, updated_at = GETDATE() WHERE id = @cartId AND user_id = @userId');

        res.status(200).json({ success: true, message: 'Cart updated' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/:id
// @access  Private
exports.removeFromCart = async (req, res) => {
    try {
        const pool = await sql.connect();
        await pool.request()
            .input('cartId', sql.Int, req.params.id)
            .input('userId', sql.Int, req.user.id)
            .query('DELETE FROM Carts WHERE id = @cartId AND user_id = @userId');

        res.status(200).json({ success: true, message: 'Item removed from cart' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};
