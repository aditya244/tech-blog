const express = require("express");
const Blog = require('../models/blog');
const router = express.Router();

router.post("", (req, res, next) => {
    console.log(req.body, 'req__body')
    const blogs = new Blog({
        title: req.body.title,
        content: req.body.content,
        tags: req.body.tags
    });
    blogs.save();
    console.log(req.body)
    res.status(201).json({
        message: 'Post added successfully'
    });
});

router.get("", (req, res, next) => {
    Blog.find()
        .then(documents => {
            res.status(200).json({
                message: 'Blogs fetched Successfully',
                blogs: documents
            });
        })
})

router.get('/:id', (req, res, next) => {
    Blog.findById(req.params.id).then(document => {
        res.status(200).json({
            message: 'Blog Post fetched successfully',
            blog: document
        })
    })
})

router.delete('/:id', (req, res, next) => {
    Blog.deleteOne({_id:req.params.id}).then(result => {
        console.log(result)
        res.status(200).json({
            message: 'Blog Post Deleted Successfully',
        })
    })
})

module.exports = router
