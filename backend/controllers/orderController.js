const { sql } = require('../config/db');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
exports.createOrder = async (req, res) => {
    const { shipping_address, phone } = req.body;

    try {
        const pool = await sql.connect();
        const transaction = new sql.Transaction(pool);

        await transaction.begin();

        try {
            // 1. Get cart items to calculate total and check stock
            const cartResult = await transaction.request()
                .input('userId', sql.Int, req.user.id)
                .query(`
                    SELECT c.product_id, c.quantity, p.price, p.stock, p.name
                    FROM Carts c
                    JOIN Products p ON c.product_id = p.id
                    WHERE c.user_id = @userId
                `);

            const cartItems = cartResult.recordset;

            if (cartItems.length === 0) {
                await transaction.rollback();
                return res.status(400).json({ message: 'Cart is empty' });
            }

            // 2. Calculate total price and check stock
            let totalPrice = 0;
            for (const item of cartItems) {
                if (item.stock < item.quantity) {
                    await transaction.rollback();
                    return res.status(400).json({ message: `Insufficient stock for ${item.name}` });
                }
                totalPrice += item.price * item.quantity;
            }

            // 3. Create Order
            const orderResult = await transaction.request()
                .input('userId', sql.Int, req.user.id)
                .input('totalPrice', sql.Decimal(10, 2), totalPrice)
                .input('address', sql.NVarChar, shipping_address)
                .input('phone', sql.NVarChar, phone)
                .query(`
                    INSERT INTO Orders (user_id, total_price, status, shipping_address, phone)
                    OUTPUT INSERTED.id
                    VALUES (@userId, @totalPrice, 'Pending', @address, @phone)
                `);

            const orderId = orderResult.recordset[0].id;

            // 4. Create Order Details and Update Stock
            for (const item of cartItems) {
                // Insert details
                await transaction.request()
                    .input('orderId', sql.Int, orderId)
                    .input('productId', sql.Int, item.product_id)
                    .input('quantity', sql.Int, item.quantity)
                    .input('price', sql.Decimal(10, 2), item.price)
                    .query(`
                        INSERT INTO Order_Details (order_id, product_id, quantity, price)
                        VALUES (@orderId, @productId, @quantity, @price)
                    `);

                // Update product stock
                await transaction.request()
                    .input('productId', sql.Int, item.product_id)
                    .input('quantity', sql.Int, item.quantity)
                    .query(`
                        UPDATE Products SET stock = stock - @quantity WHERE id = @productId
                    `);
            }

            // 5. Clear Cart
            await transaction.request()
                .input('userId', sql.Int, req.user.id)
                .query('DELETE FROM Carts WHERE user_id = @userId');

            await transaction.commit();

            res.status(201).json({
                success: true,
                message: 'Order created successfully',
                orderId
            });

        } catch (err) {
            await transaction.rollback();
            throw err;
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get user orders
// @route   GET /api/orders
// @access  Private
exports.getMyOrders = async (req, res) => {
    try {
        const pool = await sql.connect();
        const result = await pool.request()
            .input('userId', sql.Int, req.user.id)
            .query('SELECT * FROM Orders WHERE user_id = @userId ORDER BY created_at DESC');

        res.status(200).json({
            success: true,
            data: result.recordset
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get order details
// @route   GET /api/orders/:id
// @access  Private
exports.getOrderDetails = async (req, res) => {
    try {
        const pool = await sql.connect();
        
        // Get order info
        const orderResult = await pool.request()
            .input('orderId', sql.Int, req.params.id)
            .input('userId', sql.Int, req.user.id)
            .query('SELECT * FROM Orders WHERE id = @orderId AND user_id = @userId');

        if (orderResult.recordset.length === 0) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Get order items
        const detailsResult = await pool.request()
            .input('orderId', sql.Int, req.params.id)
            .query(`
                SELECT od.*, p.name, p.image_url
                FROM Order_Details od
                JOIN Products p ON od.product_id = p.id
                WHERE od.order_id = @orderId
            `);

        res.status(200).json({
            success: true,
            data: {
                ...orderResult.recordset[0],
                items: detailsResult.recordset
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};
