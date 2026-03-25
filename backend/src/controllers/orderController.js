const mongoose = require('mongoose');
const Order = require('../models/Order');
const OrderDetail = require('../models/OrderDetail');
const Cart = require('../models/Cart');
const Product = require('../models/Product');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
exports.createOrder = async (req, res) => {
    const { shipping_address, phone } = req.body;

    try {
        console.log(`Creating order for user: ${req.user.id}`);

        // 1. Get cart items to calculate total and check stock
        const cartItems = await Cart.find({ user_id: req.user.id })
            .populate('product_id', 'price stock name');

        if (cartItems.length === 0) {
            return res.status(400).json({ success: false, message: 'Giỏ hàng trống!' });
        }

        // 2. Calculate total price and check stock
        let totalPrice = 0;
        for (const item of cartItems) {
            const product = item.product_id;
            if (!product) continue;
            if (product.stock < item.quantity) {
                return res.status(400).json({ success: false, message: `Sản phẩm ${product.name} không đủ số lượng trong kho!` });
            }
            totalPrice += product.price * item.quantity;
        }

        // 3. Create Order
        const order = await Order.create({
            user_id: req.user.id,
            total_price: totalPrice,
            status: 'Pending',
            shipping_address,
            phone
        });

        // 4. Create Order Details and Update Stock
        for (const item of cartItems) {
            const product = item.product_id;
            if (!product) continue;

            await OrderDetail.create({
                order_id: order._id,
                product_id: product._id,
                quantity: item.quantity,
                price: product.price
            });

            await Product.findByIdAndUpdate(
                product._id,
                { $inc: { stock: -item.quantity } }
            );
        }

        // 5. Clear Cart
        await Cart.deleteMany({ user_id: req.user.id });

        console.log(`Order ${order._id} created successfully`);

        res.status(201).json({
            success: true,
            message: 'Đặt hàng thành công!',
            orderId: order._id
        });

    } catch (err) {
        console.error('Create Order Error:', err);
        res.status(500).json({ success: false, message: 'Server error: ' + err.message });
    }
};

// @desc    Get user orders
// @route   GET /api/orders
// @access  Private
exports.getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user_id: req.user.id })
            .sort({ created_at: -1 });

        res.status(200).json({
            success: true,
            data: orders
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
        const { id } = req.params;
        console.log(`Fetching details for order: ${id}`);

        const order = await Order.findOne({
            _id: id,
            user_id: req.user.id
        });

        if (!order) {
            console.warn(`Order not found: ${id}`);
            return res.status(404).json({ success: false, message: 'Đơn hàng không tồn tại!' });
        }

        const details = await OrderDetail.find({ order_id: order._id })
            .populate('product_id', 'name image_url');

        console.log(`Found ${details.length} items for order ${id}`);

        res.status(200).json({
            success: true,
            data: { order, details }
        });
    } catch (err) {
        console.error('Get Order Details Error:', err);
        res.status(500).json({ success: false, message: 'Lỗi server: ' + err.message });
    }
};
