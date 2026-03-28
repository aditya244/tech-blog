const mongoose = require('mongoose');
const uniqueValidator = require("mongoose-unique-validator");

const userSchema = mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String },
  email: { type: String, required: true, unique: true },

  password: { type: String }, // ✅ optional now

  isAdmin: { type: Boolean, default: false },
  readingList: [],

  resetToken: { type: String },
  resetTokenExpiration: { type: Date },

  githubId: { type: String },
  googleId: { type: String },

  authProviders: {
    type: [String],
    enum: ['local', 'google', 'github'],
    default: []
  }
});

userSchema.plugin(uniqueValidator);

module.exports = mongoose.model('User', userSchema);