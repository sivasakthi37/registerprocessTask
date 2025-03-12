const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    weight: {
        type: Number
    },
    height: {
        type: Number
    },
    medicalHistory: {
        type: String
    },
    photograph: {
        type: String
    },
    otp: {
        code: String,
        expiresAt: Date
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('User', userSchema);
