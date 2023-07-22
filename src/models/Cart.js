const { mongoose, model, Schema } = require('mongoose');

const schema = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    products: [
        {
            productId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product',
                required: true
            },
            quantity: {
                type: Number,
                required: true
            },
            sizeLetter: {
                type: String,
                enum: ['XL', 'L', 'S', 'XXL']
            }
        }
    ],
    totalQuantity: {
        type: Number,
        required: true,
        default: 0,
        validate: {
            validator: Number.isInteger,
            message: 'totalQuantity harus merupakan bilangan bulat'
        }
    },
    totalAmount: {
        type: Number,
        required: true
    },
    checkOut: {
        type: Boolean,
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = model('Cart', schema);
