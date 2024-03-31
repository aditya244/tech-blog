const express = require("express");
const Blog = require("../models/blog");
const router = express.Router();
const checkAuth = require("../middleware/check-auth");

// replicate the same logic for delete and edit button
router.post(
  "",
  checkAuth,
  (req, res, next) => {
    const isAdmin = req.headers.isadmin.trim();
    if (isAdmin === "true") {
      const blogs = new Blog({
        title: req.body.title,
        content: req.body.content,
        tags: req.body.tags,
      });
      blogs
        .save()
        .then((result) => {
          res.status(201).json({
            message: "Post added successfully",
          });
        })
        .catch((error) => {
          res.status(500).json({
            message: "An error occured while saving the blog post.",
          });
        });
    } else {
      return res.status(403).json({
        message: "You do not have rights to perform this action.",
      });
    }
  }
);

router.get("", (req, res, next) => {
  Blog.find().then((documents) => {
    res.status(200).json({
      message: "Blogs fetched Successfully",
      blogs: documents,
    });
  });
});

router.get("/:id", (req, res, next) => {
  Blog.findById(req.params.id).then((document) => {
    res.status(200).json({
      message: "Blog Post fetched successfully",
      blog: document,
    });
  });
});

router.delete("/:id", checkAuth, (req, res, next) => {
  Blog.deleteOne({ _id: req.params.id }).then((result) => {
    console.log(result);
    res.status(200).json({
      message: "Blog Post Deleted Successfully",
    });
  });
});

module.exports = router;
