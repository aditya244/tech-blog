const mongoose = require('mongoose');

const tokenBlacklistSchema = mongoose.Schema({
    token: {
        type: String,
        required: true,
        unique: true
    },
    expiresAt: {
        type: Date,
        required: true,
        index: { expires: 0 } // Auto-delete after expiration
    },
    userId: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('TokenBlacklist', tokenBlacklistSchema);
