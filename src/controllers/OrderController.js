const Cart = require('../models/Cart');
const Product = require('../models/Product');

const Order = require('../models/Order');

// Create a new order
exports.createOrder = async (req, res) => {
    try {
        const { userId, cartId } = req.body;

        const order = new Order({
            userId,
            cartId
        });

        await order.save();

        // Set timeout for 10 seconds
        setTimeout(async () => {
            const pendingOrder = await Order.findById(order._id);

            // Check if the order is still pending
            if (pendingOrder && pendingOrder.paymentStatus === 'pending') {
                // Restore product stock
                const cart = await Cart.findById(pendingOrder.cartId);
                if (cart) {
                    for (const product of cart.products) {
                        const productToUpdate = await Product.findById(product.productId);
                        if (productToUpdate) {
                            productToUpdate.sizes.find((size) => size.size === product.sizeLetter).stock += product.quantity;
                            await productToUpdate.save();
                        }
                    }
                }

                // Delete the pending order and cart
                await Order.findByIdAndDelete(pendingOrder._id);
                await Cart.findByIdAndDelete(pendingOrder.cartId);
            }
        }, 10000); // 10 seconds

        res.status(201).json({ success: true, data: order });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Gagal membuat pesanan.' });
    }
};

// Get all orders
exports.getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find();

        res.status(200).json({ success: true, data: orders });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Gagal mengambil pesanan.' });
    }
};

// Get a single order by ID
exports.getOrderById = async (req, res) => {
    try {
        const orderId = req.params.id;

        const order = await Order.findById(orderId)
            .populate({
                path: 'cartId',
                populate: {
                    path: 'products.productId',
                    select: 'name price'
                }
            })
            .populate('userId', 'username phone email');

        if (!order) {
            return res.status(404).json({ success: false, error: 'Pesanan tidak ditemukan.' });
        }

        const updatedCartId = {
            ...order.cartId._doc,
            totalQuantity: order.cartId.products.reduce((acc, product) => acc + product.quantity, 0)
        };

        res.status(200).json({ success: true, data: { ...order._doc, cartId: updatedCartId } });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Gagal mengambil pesanan.' });
    }
};




// Update an order by ID
exports.updateOrder = async (req, res) => {
    try {
        const orderId = req.params.id;

        const updatedOrder = await Order.findByIdAndUpdate(orderId, req.body, {
            new: true,
            runValidators: true
        });

        if (!updatedOrder) {
            return res.status(404).json({ success: false, error: 'Pesanan tidak ditemukan.' });
        }

        res.status(200).json({ success: true, data: updatedOrder });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Gagal memperbarui pesanan.' });
    }
};

// Delete an order by ID
exports.deleteOrder = async (req, res) => {
    try {
        const orderId = req.params.id;

        const deletedOrder = await Order.findByIdAndDelete(orderId);

        if (!deletedOrder) {
            return res.status(404).json({ success: false, error: 'Pesanan tidak ditemukan.' });
        }

        res.status(200).json({ success: true, message: 'Pesanan berhasil dihapus.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Gagal menghapus pesanan.' });
    }
};
