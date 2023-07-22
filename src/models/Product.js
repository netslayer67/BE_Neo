const { Schema, model } = require('mongoose');

const schema = new Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    sizes: {
        type: [{
            size: {
                type: String,
                required: true
            },
            stock: {
                type: Number,
                required: true
            }
        }],
        required: true
    },
    imageUrl: {
        type: String,
    },
    totalStock: {
        type: Number,
        default: 0
    }
});

module.exports = model('Product', schema);
