const Product = require('../models/Product');

// Create a new product
exports.create = async (req, res) => {
    try {
        const { name, description, price, sizes } = req.body;
        let totalStock = 0;

        // Mengambil data sizes dari req.body dan menghitung totalStock
        sizes.forEach((size) => {
            const { stock } = size;
            totalStock += parseInt(stock);
        });

        const imageUrl = req.file.filename;

        const product = await Product.create({
            name,
            description,
            price,
            sizes,
            imageUrl,
            totalStock
        });

        res.status(201).json({ success: true, data: product });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Failed to create product' });
    }
};

// Get all products
exports.getAll = async (req, res) => {
    try {
        const products = await Product.find();

        res.status(200).json({ success: true, data: products });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Failed to fetch products' });
    }
};

// Get a single product by ID
exports.getById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ success: false, error: 'Product not found' });
        }

        res.status(200).json({ success: true, data: product });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Failed to fetch product' });
    }
};

// Update a product by ID
exports.update = async (req, res) => {
    try {
        const { name, description, price, sizes } = req.body;

        let product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ success: false, error: 'Product not found' });
        }

        let totalStock = 0;
        if (sizes) {
            sizes.forEach((size) => {
                const { stock } = size;
                totalStock += parseInt(stock);
            });
        }

        // Menggabungkan hanya field yang diperlukan ke objek product
        product = Object.assign(product, {
            name: name || product.name,
            description: description || product.description,
            price: price || product.price,
            sizes: sizes || product.sizes,
            totalStock: totalStock || product.totalStock
        });

        product = await product.save();

        res.status(200).json({ success: true, data: product });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Failed to update product' });
    }
};


// Delete a product by ID
exports.deleted = async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);

        if (!product) {
            return res.status(404).json({ success: false, error: 'Product not found' });
        }

        res.status(200).json({ success: true, message: 'Product deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Failed to delete product' });
    }
};
