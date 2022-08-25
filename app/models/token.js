const mongoose = require('mongoose');

const tokenSchema = mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    refreshToken: { type: String, require: true }
}, {
    timestamps: true,
});

module.exports = mongoose.model('Token', tokenSchema);