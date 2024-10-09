const mongoose = require('mongoose');

const blogSchema = mongoose.Schema({
    title: {type: String, required: true},
    content: {type: String, required: true},
    tags: {type: Array},
    imagePath: {type: String, required: true},
    datePublished: {type: String},
    keywords: {type: Array},
    metaDescription: {type: String, required: true},
    ogTitle: {type: String},
    ogDescription: {type: String},
})

module.exports = mongoose.model('Blog', blogSchema);