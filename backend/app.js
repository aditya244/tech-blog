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
    const blogs = new Blog({
        title: req.body.blogTitle,
        paras: req.body.blogParas
    });
    blogs.save();
    console.log(req.body)
    res.status(201).json({
        message: 'Post added successfully'
    });
});

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

module.exports = app;