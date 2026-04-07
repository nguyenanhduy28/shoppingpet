const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    category_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    price: {
        type: Number,
        required: true
    },
    stock: {
        type: Number,
        default: 0
    },
    breed: {
        type: String
    },
    specs: {
        type: String
    },
    image_url: {
        type: String
    }
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

module.exports = mongoose.model('Product', productSchema);
