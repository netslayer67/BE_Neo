const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { JWT_SECRET, JWT_EXPIRATION } = require('../config/constants')

const generateToken = async (user) => {
    const payload = {
        id: user.id,
        username: user.username,
    };

    return await jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRATION });
};

const registerUser = async (req, res) => {
    const {
        username,
        email,
        phone,
        password,
    } = req.body;

    try {
        let user = await User.findOne({ $or: [{ username }, { email }] });

        if (user) {
            return res
                .status(400)
                .json({ message: 'Username or email already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        user = new User({
            username,
            email,
            phone,
            password: hashedPassword,
        });

        await user.save();

        const token = await generateToken(user);

        res.json({ token, user });
    } catch (error) {
        console.error('Failed to register user:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const loginUser = async (req, res) => {
    const { username, password } = req.body;

    try {
        let user = await User.findOne({ username });

        if (!user) {
            return res.status(400).json({ message: 'Invalid username' });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid password' });
        }

        const token = await generateToken(user);

        res.json({
            token,
            user,
        });
    } catch (error) {
        console.error('Failed to log in user:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = {
    registerUser,
    loginUser,
};