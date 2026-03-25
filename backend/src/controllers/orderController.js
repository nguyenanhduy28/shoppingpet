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

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // 1. Get cart items to calculate total and check stock
        const cartItems = await Cart.find({ user_id: req.user.id })
            .populate('product_id', 'price stock name')
            .session(session);

        if (cartItems.length === 0) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ message: 'Cart is empty' });
        }

        // 2. Calculate total price and check stock
        let totalPrice = 0;
        for (const item of cartItems) {
            const product = item.product_id;
            if (product.stock < item.quantity) {
                await session.abortTransaction();
                session.endSession();
                return res.status(400).json({ message: `Insufficient stock for ${product.name}` });
            }
            totalPrice += product.price * item.quantity;
        }

        // 3. Create Order
        const [order] = await Order.create([{
            user_id: req.user.id,
            total_price: totalPrice,
            status: 'Pending',
            shipping_address,
            phone
        }], { session });

        // 4. Create Order Details and Update Stock
        for (const item of cartItems) {
            const product = item.product_id;

            await OrderDetail.create([{
                order_id: order._id,
                product_id: product._id,
                quantity: item.quantity,
                price: product.price
            }], { session });

            await Product.findByIdAndUpdate(
                product._id,
                { $inc: { stock: -item.quantity } },
                { session }
            );
        }

        // 5. Clear Cart
        await Cart.deleteMany({ user_id: req.user.id }).session(session);

        await session.commitTransaction();
        session.endSession();

        res.status(201).json({
            success: true,
            message: 'Order created successfully',
            orderId: order._id
        });

    } catch (err) {
        await session.abortTransaction();
        session.endSession();
        console.error(err);
        res.status(500).json({ message: 'Server error' });
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
        // Get order info
        const order = await Order.findOne({
            _id: req.params.id,
            user_id: req.user.id
        });

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Get order items
        const items = await OrderDetail.find({ order_id: order._id })
            .populate('product_id', 'name image_url');

        const itemsData = items.map(item => ({
            _id: item._id,
            order_id: item.order_id,
            product_id: item.product_id._id,
            quantity: item.quantity,
            price: item.price,
            name: item.product_id.name,
            image_url: item.product_id.image_url
        }));

        res.status(200).json({
            success: true,
            data: {
                ...order.toObject(),
                items: itemsData
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};
