const mongoose = require('mongoose');

const blogSchema = mongoose.Schema({
    title: {type: String, required: true},
    paras: {type: Array, required: true},
})

module.exports = mongoose.model('Blog', blogSchema);