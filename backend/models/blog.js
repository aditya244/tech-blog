const mongoose = require('mongoose');

const blogSchema = mongoose.Schema({
    title: {type: String, required: true},
    content: {type: String}
})

module.exports = mongoose.model('Blog', blogSchema);