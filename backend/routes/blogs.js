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

router.put("/edit-blog/:id", (req, res, next) => {
  console.log(req.params, 'REQ_EDIT')
  const blog = new Blog({
    _id: req.params.id,
    title: req.body.title,
    content: req.body.content,
    tags: req.body.tags
  })
  Blog.updateOne({_id: req.params.id}, blog)
    .then((result) => {
      console.log(result);
      res.status(200).json({ message: "Blog Updated Successfully" })
    })
})

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

router.get('/readingListBlogs/:ids', (req, res, next) => {
  // tried sending ids by query params but it is not helping
  const blogIds = req.params.ids.split(','); 
  Blog.find({ _id: { $in: blogIds } })
    .then((blogs) => {
      if (blogs.length) {
        return res.status(200).json({
          message: 'Blogs fetched successfully',
          blogs: blogs
        });
      } else {
        return res.status(404).json({
          message: 'No blogs present in the Reading list. Add new blogs!'
        });
      }
    })
    .catch((error) => {
      console.log(error);
      return res.status(500).json({
        message: 'An error occurred while fetching blogs'
      });
    });
});

module.exports = router;
