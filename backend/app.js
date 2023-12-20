const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const app = express();

mongoose.connect("mongodb+srv://aditya:V53bkdhA4QHBKB9U@cluster0.eciv35m.mongodb.net/blog?retryWrites=true&w=majority")
    .then(() => {
        console.log('Connected to database');
    })
    .catch(() => {
        console.log('Connection to database failed');
    })

const Blog = require('./models/blog');
const Comment = require('./models/comment');

app.use(bodyParser.json());

app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader(
        "Access-Control-Allow-Headers", 
        "Origin, X-Requested-With, Content-Type, Accept"
    );
    res.setHeader("Access-Control-Allow-Methods", 
        "GET, POST, PATCH, DELETE, OPTIONS"
    );
    next();
})

app.post("/api/blogs", (req, res, next) => {
    console.log(req.body, 'req__body')
    const blogs = new Blog({
        title: req.body.title,
        content: req.body.content
    });
    blogs.save();
    console.log(req.body)
    res.status(201).json({
        message: 'Post added successfully'
    });
});

app.post("/api/comments", (req, res, next) => {
    const comments = new Comment({
        comment: req.body.comment,
        blogId: req.body.blogId
    });
    comments.save();
    res.status(201).json({
        message: 'Comment Added successfully'
    })
})

app.get('/api/blogs', (req, res, next) => {
    Blog.find()
        .then(documents => {
            res.status(200).json({
                message: 'Blogs fetched Successfully',
                blogs: documents
            });
        })
})

app.get('/api/blogs/:id', (req, res, next) => {
    Blog.findById(req.params.id).then(document => {
        res.status(200).json({
            message: 'Blog Post fetched successfully',
            blog: document
        })
    })
})

app.get('/api/comments/:blogId', (req, res, next) => {
    Comment.find({blogId:req.params.blogId}).then(documents => {
        res.status(200).json({
            message: 'Comments fetched succesfully',
            comments: documents
        })
    })
})

app.delete('/api/blogs/:id', (req, res, next) => {
    Blog.deleteOne({_id:req.params.id}).then(result => {
        console.log(result)
        res.status(200).json({
            message: 'Blog Post Deleted Successfully',
        })
    })
})

module.exports = app;