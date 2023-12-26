const mongoose = require('mongoose');

const commentSchema = mongoose.Schema({
    comment: {type: String, required: true},
    blogId: {type: String},
    dateOfPublish: {type: Date}
})

module.exports = mongoose.model('Comment', commentSchema);