const { sql } = require('../config/db');

// @desc    Get all categories
// @route   GET /api/products/categories
// @access  Public
exports.getCategories = async (req, res) => {
    try {
        const pool = await sql.connect();
        const result = await pool.request().query('SELECT * FROM Categories');
        res.status(200).json({ success: true, data: result.recordset });
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
        const offset = (page - 1) * limit;

        const pool = await sql.connect();
        let query = 'SELECT p.*, c.name as category_name FROM Products p JOIN Categories c ON p.category_id = c.id WHERE 1=1';
        let countQuery = 'SELECT COUNT(*) as total FROM Products p JOIN Categories c ON p.category_id = c.id WHERE 1=1';
        const request = pool.request();

        if (category) {
            query += ' AND c.name = @category';
            countQuery += ' AND c.name = @category';
            request.input('category', sql.NVarChar, category);
        }

        if (search) {
            query += ' AND (p.name LIKE @search OR p.description LIKE @search OR p.breed LIKE @search)';
            countQuery += ' AND (p.name LIKE @search OR p.description LIKE @search OR p.breed LIKE @search)';
            request.input('search', sql.NVarChar, `%${search}%`);
        }

        if (minPrice) {
            query += ' AND p.price >= @minPrice';
            countQuery += ' AND p.price >= @minPrice';
            request.input('minPrice', sql.Decimal, minPrice);
        }

        if (maxPrice) {
            query += ' AND p.price <= @maxPrice';
            countQuery += ' AND p.price <= @maxPrice';
            request.input('maxPrice', sql.Decimal, maxPrice);
        }

        // Get total count for pagination
        const totalResult = await request.query(countQuery);
        const total = totalResult.recordset[0].total;

        // Add pagination and execute final query
        query += ` ORDER BY p.created_at DESC OFFSET ${offset} ROWS FETCH NEXT ${limit} ROWS ONLY`;
        const result = await request.query(query);

        res.status(200).json({
            success: true,
            count: result.recordset.length,
            total,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(total / limit)
            },
            data: result.recordset
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
        const pool = await sql.connect();
        const result = await pool.request()
            .input('id', sql.Int, req.params.id)
            .query('SELECT p.*, c.name as category_name FROM Products p JOIN Categories c ON p.category_id = c.id WHERE p.id = @id');

        if (result.recordset.length === 0) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.status(200).json({ success: true, data: result.recordset[0] });
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
        const pool = await sql.connect();
        const result = await pool.request().query('SELECT TOP 8 p.*, c.name as category_name FROM Products p JOIN Categories c ON p.category_id = c.id ORDER BY p.created_at DESC');
        res.status(200).json({ success: true, data: result.recordset });
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
        const pool = await sql.connect();
        await pool.request()
            .input('category_id', sql.Int, category_id)
            .input('name', sql.NVarChar, name)
            .input('description', sql.NVarChar, description)
            .input('price', sql.Decimal(10, 2), price)
            .input('stock', sql.Int, stock)
            .input('breed', sql.NVarChar, breed)
            .input('specs', sql.NVarChar, specs)
            .input('image_url', sql.NVarChar, image_url)
            .query(`
                INSERT INTO Products (category_id, name, description, price, stock, breed, specs, image_url)
                VALUES (@category_id, @name, @description, @price, @stock, @breed, @specs, @image_url)
            `);

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
        const pool = await sql.connect();
        await pool.request()
            .input('id', sql.Int, req.params.id)
            .input('category_id', sql.Int, category_id)
            .input('name', sql.NVarChar, name)
            .input('description', sql.NVarChar, description)
            .input('price', sql.Decimal(10, 2), price)
            .input('stock', sql.Int, stock)
            .input('breed', sql.NVarChar, breed)
            .input('specs', sql.NVarChar, specs)
            .input('image_url', sql.NVarChar, image_url)
            .query(`
                UPDATE Products SET 
                    category_id = @category_id, name = @name, description = @description, 
                    price = @price, stock = @stock, breed = @breed, specs = @specs, 
                    image_url = @image_url, updated_at = GETDATE()
                WHERE id = @id
            `);

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
        const pool = await sql.connect();
        await pool.request()
            .input('id', sql.Int, req.params.id)
            .query('DELETE FROM Products WHERE id = @id');

        res.status(200).json({ success: true, message: 'Product deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
