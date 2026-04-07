const Product = require('../models/Product');
const Category = require('../models/Category');

// @desc    Get all categories
// @route   GET /api/products/categories
// @access  Public
exports.getCategories = async (req, res) => {
    try {
        const categories = await Category.find();
        res.status(200).json({ success: true, data: categories });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get all products with filtering, search, and pagination
// @route   GET /api/products
// @access  Public
exports.getProducts = async (req, res) => {
    try {
        const { category, search, minPrice, maxPrice, page = 1, limit = 10 } = req.query;
        const skip = (page - 1) * limit;

        // Build filter object
        let filter = {};

        if (category) {
            const cat = await Category.findOne({ name: category });
            if (cat) {
                filter.category_id = cat._id;
            }
        }

        if (search) {
            const searchRegex = new RegExp(search, 'i');
            filter.$or = [
                { name: searchRegex },
                { description: searchRegex },
                { breed: searchRegex }
            ];
        }

        if (minPrice) {
            filter.price = { ...filter.price, $gte: parseFloat(minPrice) };
        }

        if (maxPrice) {
            filter.price = { ...filter.price, $lte: parseFloat(maxPrice) };
        }

        // Get total count for pagination
        const total = await Product.countDocuments(filter);

        // Get products with populated category
        const products = await Product.find(filter)
            .populate('category_id', 'name')
            .sort({ created_at: -1 })
            .skip(parseInt(skip))
            .limit(parseInt(limit));

        // Map to match original response format (category_name field)
        const data = products.map(p => {
            const obj = p.toObject();
            obj.category_name = obj.category_id ? obj.category_id.name : null;
            return obj;
        });

        res.status(200).json({
            success: true,
            count: data.length,
            total,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(total / limit)
            },
            data
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
exports.getProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)
            .populate('category_id', 'name');

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        const data = product.toObject();
        data.category_name = data.category_id ? data.category_id.name : null;

        res.status(200).json({ success: true, data });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get latest products for homepage
// @route   GET /api/products/latest
// @access  Public
exports.getLatestProducts = async (req, res) => {
    try {
        const products = await Product.find()
            .populate('category_id', 'name')
            .sort({ created_at: -1 })
            .limit(8);

        const data = products.map(p => {
            const obj = p.toObject();
            obj.category_name = obj.category_id ? obj.category_id.name : null;
            return obj;
        });

        res.status(200).json({ success: true, data });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// --- ADMIN CRUD ---

// @desc    Create product
// @route   POST /api/products
// @access  Private/Admin
exports.createProduct = async (req, res) => {
    const { category_id, name, description, price, stock, breed, specs, image_url } = req.body;
    try {
        await Product.create({
            category_id, name, description, price, stock, breed, specs, image_url
        });

        res.status(201).json({ success: true, message: 'Product created' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Admin
exports.updateProduct = async (req, res) => {
    const { category_id, name, description, price, stock, breed, specs, image_url } = req.body;
    try {
        await Product.findByIdAndUpdate(req.params.id, {
            category_id, name, description, price, stock, breed, specs, image_url
        });

        res.status(200).json({ success: true, message: 'Product updated' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/Admin
exports.deleteProduct = async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);

        res.status(200).json({ success: true, message: 'Product deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
