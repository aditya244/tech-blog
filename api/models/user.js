const mongoose = require('mongoose');
const uniqueValidator = require("mongoose-unique-validator");

const userSchema = mongoose.Schema({
    firstName: {type: String, required: true},
    lastName: {type: String},
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    isAdmin: { type: Boolean, default: false },
    readingList: [],
    resetToken: {type: String},
    resetTokenExpiration: {type: Date},
    authProvider: { type: String, default: 'local' },
})

userSchema.plugin(uniqueValidator);

module.exports = mongoose.model('User', userSchema);