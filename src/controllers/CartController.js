const Cart = require('../models/Cart');
const Product = require('../models/Product');

const CART_RESET_DURATION = 5 * 1000; // 3 hari dalam milidetik

exports.create = async (req, res) => {
    try {
        const { userId, products } = req.body;

        let cart = await Cart.findOne({ userId });

        // Perbarui cart jika ada, atau buat cart baru jika belum ada
        if (!cart) {
            cart = new Cart({
                userId,
                products: [],
                totalQuantity: 0,
                totalAmount: 0,
                checkOut: false, // Set status checkout menjadi false saat cart dibuat
                createdAt: new Date(), // Simpan waktu pembuatan cart
            });
        }

        const currentTime = new Date();
        const cartAge = currentTime - cart.createdAt;

        // Jika cart belum checkout dan sudah berumur lebih dari 3 hari, hapus cart dan kembalikan stok produk
        if (!cart.checkOut && cartAge >= CART_RESET_DURATION) {
            await resetCart(cart);
            return res.status(200).json({ success: true, message: 'Keranjang dibuat ulang karena belum di-checkout selama 3 hari', data: cart });
        }

        for (let i = 0; i < products.length; i++) {
            const { productId, quantity, sizeLetter } = products[i];

            const product = await Product.findById(productId);

            if (!product) {
                return res.status(404).json({ success: false, error: `Produk dengan ID ${productId} tidak ditemukan` });
            }

            const selectedSize = product.sizes.find((size) => size.size === sizeLetter);

            if (!selectedSize) {
                return res.status(400).json({ success: false, error: `Ukuran ${sizeLetter} tidak tersedia untuk produk ${product.name}` });
            }

            if (selectedSize.stock < quantity) {
                return res.status(400).json({ success: false, error: `Stok ukuran ${sizeLetter} untuk produk ${product.name} tidak mencukupi` });
            }

            const existingProductIndex = cart.products.findIndex((item) => item.productId.toString() === productId && item.sizeLetter === sizeLetter);

            if (existingProductIndex !== -1) {
                cart.products[existingProductIndex].quantity += quantity;
            } else {
                cart.products.push({
                    productId,
                    quantity,
                    sizeLetter,
                });
            }

            selectedSize.stock -= quantity;

            cart.totalQuantity += quantity;
            cart.totalAmount += product.price * quantity;

            await product.save(); // Simpan perubahan stok produk
        }

        cart.createdAt = currentTime; // Perbarui waktu pembuatan cart setelah pembaharuan

        await cart.save();

        // Set timeout for 3 days
        setTimeout(async () => {
            const updatedCart = await Cart.findById(cart._id);

            // Check if the cart is still not checked out
            if (updatedCart && !updatedCart.checkOut) {
                await resetCart(updatedCart);
            }
        }, CART_RESET_DURATION);

        const formattedCreateLocal = getFormattedDate(cart.createdAt);

        res.status(200).json({ success: true, message: 'Produk berhasil ditambahkan ke keranjang', data: { ...cart._doc, createLocal: formattedCreateLocal } });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Gagal menambahkan produk ke keranjang' });
    }
};

// Fungsi untuk mengembalikan tanggal dalam format "(Hari), (Tanggal) (Tahun)"
const getFormattedDate = (date) => {
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

    const day = days[date.getDay()];
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    const formattedDate = `${day}, ${date.getDate()} ${month} ${year}`;

    return formattedDate;
};

// Fungsi untuk mereset cart jika belum checkout
const resetCart = async (cart) => {
    for (const productItem of cart.products) {
        const { productId, quantity, sizeLetter } = productItem;
        const product = await Product.findById(productId);

        if (product) {
            const selectedSize = product.sizes.find((size) => size.size === sizeLetter);
            if (selectedSize) {
                selectedSize.stock += quantity; // Kembalikan stok produk
                await product.save(); // Simpan perubahan stok produk
            }
        }
    }

    await Cart.findByIdAndDelete(cart._id); // Hapus cart dari database
};


// Get all carts
exports.getAllCarts = async (req, res) => {
    try {
        const allCarts = await Cart.find().populate('userId', 'name email'); // Menggunakan populate untuk mengambil data user (userId) dari model User dan mengambil field 'name' dan 'email' saja

        const updatedCarts = allCarts.map((cart) => {
            return {
                _id: { id: cart._id.toString() },
                userId: { id: cart.userId._id.toString(), name: cart.userId.name, email: cart.userId.email },
                products: cart.products.map((product) => {
                    return {
                        name: product.productId.name,
                        productId: { id: product.productId._id.toString() },
                        quantity: product.quantity,
                        sizeLetter: product.sizeLetter,
                        _id: { id: product._id.toString() },
                    };
                }),
                totalQuantity: cart.totalQuantity,
                totalAmount: cart.totalAmount,
                checkOut: cart.checkOut,
                __v: cart.__v,
            };
        });

        res.status(200).json(updatedCarts);
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Gagal mengambil daftar keranjang' });
    }
};


// Get cart by user ID
exports.getCartByUserId = async (req, res) => {
    try {
        const { id } = req.params;
        const cart = await Cart.findOne({ userId: id }).populate('products.productId');

        if (!cart) {
            return res.status(404).json({ success: false, error: 'Keranjang tidak ditemukan' });
        }

        const updatedCart = {
            _id: { id: cart._id.toString() },
            userId: { id: cart.userId.toString() },
            products: cart.products.map((product) => {
                return {
                    name: product.productId.name,
                    productId: { id: product.productId._id.toString() },
                    quantity: product.quantity,
                    sizeLetter: product.sizeLetter,
                    _id: { id: product._id.toString() },
                };
            }),
            totalQuantity: cart.totalQuantity,
            totalAmount: cart.totalAmount,
            __v: cart.__v,
        };

        res.status(200).json(updatedCart);
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Gagal mengambil keranjang' });
    }
};

// Update cart item quantity
exports.update = async (req, res) => {
    try {
        const { userId, productId, sizeLetter, quantity } = req.body;

        const existingCartItem = await Cart.findOne({ userId });

        if (!existingCartItem) {
            return res.status(404).json({ success: false, error: 'Produk tidak ditemukan di dalam keranjang' });
        }

        const cartProduct = existingCartItem.products.find((product) => product.productId.toString() === productId && product.sizeLetter === sizeLetter);

        if (!cartProduct) {
            return res.status(404).json({ success: false, error: 'Produk tidak ditemukan di dalam keranjang' });
        }

        const productToUpdate = await Product.findById(productId);

        if (!productToUpdate) {
            return res.status(404).json({ success: false, error: 'Produk tidak ditemukan' });
        }

        const size = productToUpdate.sizes.find((size) => size.size === sizeLetter);

        if (!size) {
            return res.status(404).json({ success: false, error: `Ukuran ${sizeLetter} untuk produk ${productToUpdate.name} tidak ditemukan` });
        }

        if (quantity > 0) {
            if (quantity > cartProduct.quantity) {
                return res.status(400).json({ success: false, error: 'Kuantitas produk dalam keranjang tidak mencukupi' });
            }

            size.stock += quantity; // Kembalikan stok produk
            cartProduct.quantity -= quantity; // Kurangi kuantitas produk dalam keranjang

            existingCartItem.totalQuantity -= quantity;
            existingCartItem.totalAmount -= productToUpdate.price * quantity;

            if (cartProduct.quantity === 0) {
                // Hapus produk dari keranjang jika kuantitas menjadi 0
                existingCartItem.products = existingCartItem.products.filter(
                    (product) => product.productId.toString() !== productId || product.sizeLetter !== sizeLetter
                );
            }
        }

        await existingCartItem.save();
        await productToUpdate.save();

        res.status(200).json({ success: true, message: 'Jumlah produk dalam keranjang berhasil diperbarui', data: existingCartItem });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Gagal memperbarui jumlah produk dalam keranjang' });
    }
};

// Remove product from cart
exports.deleted = async (req, res) => {
    try {
        const { userId, productId } = req.body;

        const existingCartItem = await Cart.findOne({ userId });

        if (!existingCartItem) {
            return res.status(404).json({ success: false, error: 'Produk tidak ditemukan di dalam keranjang' });
        }

        existingCartItem.products = existingCartItem.products.filter((product) => product.productId.toString() !== productId);
        existingCartItem.totalQuantity = existingCartItem.products.reduce((total, product) => total + product.quantity, 0);

        await existingCartItem.save();

        res.status(200).json({ success: true, message: 'Produk berhasil dihapus dari keranjang', data: existingCartItem });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Gagal menghapus produk dari keranjang' });
    }
};

