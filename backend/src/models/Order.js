const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    total_price: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Shipped', 'Completed', 'Cancelled'],
        default: 'Pending'
    },
    shipping_address: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    }
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

module.exports = mongoose.model('Order', orderSchema);
