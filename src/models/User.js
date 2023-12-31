const { Schema, model } = require('mongoose');

const schema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    phone: {
        type: Number,
    },
    role: {
        type: String,
        enum: ['admin', 'client'],
        default: 'admin'
    }
})

module.exports = model('User', schema);