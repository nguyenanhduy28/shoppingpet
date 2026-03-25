const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const app = express();

// Body parser
app.use(express.json());

// Cookie parser
app.use(cookieParser());

// Enable CORS
app.use(cors({
    origin: ['http://localhost:5500', 'http://127.0.0.1:5500'],
    credentials: true
}));

// Define routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/cart', require('./routes/cartRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

// Basic test route
app.get('/', (req, res) => {
    res.send('Pet Shop API is running...');
});

// 404 Handler for API
app.use((req, res) => {
    res.status(404).json({ success: false, message: 'Route not found' });
});

module.exports = app;
