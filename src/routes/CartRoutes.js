const express = require('express');
const { create, getAllCarts, getCartByUserId, update, deleted } = require('../controllers/CartController');
const router = express.Router();

router.get('/carts', getAllCarts);
router.get('/carts/:id', getCartByUserId);
router.post('/carts', create);
router.put('/carts/:id', update);
router.delete('/carts/:id', deleted);

module.exports = router;
