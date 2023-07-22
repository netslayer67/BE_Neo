const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { JWT_SECRET, JWT_EXPIRATION } = require('../config/constants');
const bcrypt = require('bcryptjs');

const GetAll = async (req, res) => {
    try {
        const users = await User.find().select('-password');
        return res.status(200).json({
            message: 'USERS_FOUND',
            success: true,
            data: users,
        });
    } catch (error) {
        console.error('Failed to get all users:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

const GetbyId = async (req, res) => {
    const { id } = req.params;
    try {

        const user = await User.findById(id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(user);

    } catch (error) {
        console.error(`Failed to get user with id ${id}:`, error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

const Update = async (req, res) => {
    const { id } = req.params;
    const userData = req.body;

    try {
        let user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const { username } = userData;
        // Perbarui data pengguna
        Object.assign(user, userData);
        // Cek apakah ada perubahan pada password
        const { oldPassword, newPassword } = userData;
        if (oldPassword && newPassword) {
            /* Cek apakah oldPassword cocok dengan password lama di database */
            const isMatch = await bcrypt.compare(oldPassword, user.password);

            /* Jika tidak sama */
            if (!isMatch) {
                return res.status(400).json({ message: 'Password lama salah' });
            }

            /* Jika sama, maka hash newPassword, lalu set ke user */
            const salt = await bcrypt.genSalt(10);
            const hash = await bcrypt.hash(newPassword, salt);
            user.password = hash;
        }

        // Simpan perubahan pada data pengguna
        await user.save();

        const payload = {
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                phone: user.phone,
            },
        };

        jwt.sign(
            payload,
            JWT_SECRET,
            { expiresIn: JWT_EXPIRATION },
            (error, token) => {
                if (error) {
                    throw error;
                }

                res.json({ token, user: payload.user });
            }
        );
    } catch (error) {
        console.error(`Failed to update user with id ${id}:`, error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

const Deleted = async (req, res) => {
    const { id } = req.params;

    try {
        const user = await User.findByIdAndDelete(id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({ message: 'User deleted' });
    } catch (error) {
        console.error(`Failed to delete user with id ${id}:`, error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

module.exports = {
    GetAll,
    GetbyId,
    Update,
    Deleted
}