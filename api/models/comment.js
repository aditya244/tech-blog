const mongoose = require('mongoose');

const commentSchema = mongoose.Schema({
    comment: {type: String, required: true},
    blogId: {type: String, required: true},
    dateOfPublish: {type: Date, required: true},
    authorName: {type: String, required: true},
    authorEmail: {type: String, required: true},
    isAdmin: {type: Boolean, default: false},
    parentCommentId: {type: String, default: null}
})

module.exports = mongoose.model('Comment', commentSchema);