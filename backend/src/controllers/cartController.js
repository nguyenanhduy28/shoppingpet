const Cart = require('../models/Cart');
const Product = require('../models/Product');

// @desc    Get current user's cart
// @route   GET /api/cart
// @access  Private
exports.getCart = async (req, res) => {
    try {
        const cartItems = await Cart.find({ user_id: req.user.id })
            .populate('product_id', 'name price image_url stock');

        const data = cartItems.map(item => {
            const product = item.product_id;
            return {
                cart_id: item._id,
                product_id: product._id,
                quantity: item.quantity,
                name: product.name,
                price: product.price,
                image_url: product.image_url,
                stock: product.stock,
                subtotal: item.quantity * product.price
            };
        });

        res.status(200).json({
            success: true,
            data
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
        // 1. Check if item already exists in cart
        const existingItem = await Cart.findOne({
            user_id: req.user.id,
            product_id: product_id
        });

        if (existingItem) {
            // Update quantity
            existingItem.quantity += (quantity || 1);
            await existingItem.save();
        } else {
            // Insert new item
            await Cart.create({
                user_id: req.user.id,
                product_id: product_id,
                quantity: quantity || 1
            });
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
        await Cart.findOneAndUpdate(
            { _id: req.params.id, user_id: req.user.id },
            { quantity }
        );

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
        await Cart.findOneAndDelete({
            _id: req.params.id,
            user_id: req.user.id
        });

        res.status(200).json({ success: true, message: 'Item removed from cart' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};
