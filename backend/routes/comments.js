const express = require("express");
const Comment = require('../models/comment');
const router = express.Router();
const checkAuth = require("../middleware/check-auth");

router.post("", checkAuth, (req, res, next) => {
    const comments = new Comment({
        comment: req.body.comment,
        blogId: req.body.blogId,
        dateOfPublish: req.body.dateOfPublish
    });
    console.log(req.body)
    comments.save();
    res.status(201).json({
        message: 'Comment added successfully'
    })
})

router.get('/:blogId', (req, res, next) => {
    Comment.find({blogId:req.params.blogId}).then(documents => {
        res.status(200).json({
            message: 'Comments fetched succesfully',
            comments: documents
        })
    })
})

router.delete('/:commentId', checkAuth, (req, res, next) => {
    Comment.deleteOne({_id: req.params.commentId}).then(result => {
        console.log(result);
        res.status(200).json({
            message: 'Comment deleted successfully'
        })
    })
})

module.exports = router;