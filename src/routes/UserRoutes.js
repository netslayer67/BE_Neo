const express = require('express');
const { GetAll, GetbyId, Update, Deleted } = require('../controllers/UserController')
const authMiddleware = require('../middleware/AuthMiddleware'); // Import authMiddleware

const router = express.Router();

// Middleware authMiddleware akan diterapkan pada semua rute yang ada di bawah ini
router.use(authMiddleware);

// Get all users
router.get('/users', GetAll);
router.get('/users/:id', GetbyId);
router.patch('/users/:id', Update);
router.delete('/users/:id', Deleted);

module.exports = router;