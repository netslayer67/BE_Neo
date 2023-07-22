const express = require('express');
const upload = require('../middleware/Multer');
const {
    getAll,
    getById,
    create,
    update,
    deleted
} = require('../controllers/ProductController');

const router = express.Router();

router.get('/products', getAll);
router.get('/products/:id', getById);
router.post('/products', upload.single('image'), create);
router.patch('/products/:id', update);
router.delete('/products/:id', deleted);

module.exports = router;
