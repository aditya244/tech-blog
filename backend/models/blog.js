const mongoose = require('mongoose');

const blogSchema = mongoose.Schema({
    title: {type: String, required: true},
    content: {type: String},
    tags: {type: Array}
})

module.exports = mongoose.model('Blog', blogSchema);