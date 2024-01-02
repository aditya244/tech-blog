const express = require("express");
const Comment = require('../models/comment');
const router = express.Router();

router.post("", (req, res, next) => {
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

module.exports = router;