const express = require('express');
const { check } = require('express-validator');
const validate = require('../config/validator');
const authMiddleware = require('../middleware/AuthMiddleware');
const { registerUser, loginUser } = require('../controllers/AuthController')
const router = express.Router();

// Register user
router.post(
    '/register',
    [
        check('username', 'Username is required').not().isEmpty(),
        check('email', 'Email is required').isEmail(),
        check('password', 'Password is required').not().isEmpty(),
        validate,
    ],
    registerUser
);

// Login user
router.post(
    '/login',
    [
        check('username', 'Username is required').not().isEmpty(),
        check('password', 'Password is required').not().isEmpty(),
        validate,
    ],
    loginUser
);

router.get('/protected', authMiddleware, (req, res) => {
    try {
        // Rute terlindungi hanya dapat diakses oleh user yang terotentikasi
        // Lakukan operasi yang sesuai di sini

        return res.status(200).json({ message: 'Authorization Passed.' });
    } catch (error) {
        console.error('Failed to access protected route:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;