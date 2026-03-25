const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
    const { full_name, email, password } = req.body;

    try {
        // 1. Check if user exists
        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ success: false, message: 'Email đã được sử dụng!' });
        }

        // 2. Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 3. Create user
        await User.create({
            full_name,
            email,
            password: hashedPassword,
            role: 'customer'
        });

        res.status(201).json({ success: true, message: 'Đăng ký tài khoản thành công!' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Lỗi server!' });
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user || user.is_banned) {
            return res.status(401).json({ success: false, message: 'Email không tồn tại hoặc tài khoản bị khóa!' });
        }

        // 4. Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Mật khẩu không chính xác!' });
        }

        // 5. Create token
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRE }
        );

        res.status(200).json({
            success: true,
            token,
            user: {
                id: user._id,
                full_name: user.full_name,
                email: user.email,
                role: user.role
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Lỗi server!' });
    }
};

// @desc    Logout user (client-side only for JWT)
exports.logout = (req, res) => {
    res.status(200).json({ success: true, message: 'Đăng xuất thành công!' });
};

// @desc    Get current user profile
// @route   GET /api/auth/profile
// @access  Private
exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ success: false, message: 'Người dùng không tồn tại!' });
        }
        res.status(200).json({ success: true, data: user });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Lỗi server!' });
    }
};
