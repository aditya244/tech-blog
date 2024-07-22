const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const app = express();
const path = require('path');

const blogRoutes = require("./routes/blogs");
const commentRoutes = require("./routes/comments");
const userRoutes = require("./routes/user");
const subscriptionRoutes = require("./routes/subscribe")

const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://aditya:V53bkdhA4QHBKB9U@cluster0.eciv35m.mongodb.net/blog?retryWrites=true&w=majority"

mongoose.connect(MONGODB_URI)
    .then(() => {
        console.log('Connected to database');
    })
    .catch(() => {
        console.log(MONGODB_URI)
        console.log('Connection to database failed');
    })


app.use(bodyParser.json());
app.use("/images", express.static(path.join("/images")));

app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader(
        "Access-Control-Allow-Headers", 
        "Origin, X-Requested-With, Content-Type, Accept, Authorization, isAdmin"
    );
    res.setHeader("Access-Control-Allow-Methods", 
        "GET, POST, PATCH, DELETE, OPTIONS, PUT"
    );
    next();
})

app.use("/api/blogs", blogRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/user", userRoutes)
app.use("/api", subscriptionRoutes)

module.exports = app;