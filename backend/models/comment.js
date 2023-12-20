const mongoose = require('mongoose');

const commentSchema = mongoose.Schema({
    comment: {type: String, required: true},
    blogId: {type: String},
})

module.exports = mongoose.model('Comment', commentSchema);