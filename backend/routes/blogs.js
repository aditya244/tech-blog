const express = require("express");
const Blog = require("../models/blog");
const router = express.Router();
const checkAuth = require("../middleware/check-auth");
const multer = require("multer");

const MIME_TYPE_MAP = {
  'image/png': 'png',
  'image/jpeg': 'jpeg',
  'image/jpg': 'jpg'
}

const storage = multer.diskStorage({
  destination: (req, file, callBack) => {
    const isValid = MIME_TYPE_MAP[file.mimetype];
    let error  =  new Error("Invalid mime type")
    if (isValid) {
      error = null;
    }
    callBack(error, "backend/images");
  },
  filename: (req, file, callBack) => {
    const name = file.originalname.toLowerCase().split('').join('-');
    const ext = MIME_TYPE_MAP[file.mimetype];
    callBack(null, name + '-' + Date.now() + '.' + ext);
  }
});

// replicate the same logic for delete and edit button
router.post(
  "",
  checkAuth,
  multer({storage: storage}).single("image"),
  (req, res, next) => {
    const url = req.protocol + '://' + req.get("host");
    console.log(req.body, 'REQ')
    const isAdmin = req.headers.isadmin.trim();
    if (isAdmin === "true") {
      const blogs = new Blog({
        title: req.body.title,
        content: req.body.content,
        tags: req.body.tags,
        imagePath: url + "/images/" + req.file.filename
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

router.put(
  "/edit-blog/:id",
  multer({ storage: storage }).single("image"),
  (req, res, next) => {
    console.log(req.file, "REQ_EDIT");
    console.log(req.body, 'REQ_BODY')
    let imagePath = req.body.imagePath;
    if(req.file) {
      const url = req.protocol + '://' + req.get("host");
      imagePath = url + "/images/" + req.file.filename
    }
    console.log(imagePath, 'imagePath')
    const blog = new Blog({
      _id: req.params.id,
      title: req.body.title,
      content: req.body.content,
      tags: req.body.tags,
      imagePath: imagePath
    });
    Blog.updateOne({ _id: req.params.id }, blog).then((result) => {
      console.log(result);
      res.status(200).json({ message: "Blog Updated Successfully" });
    });
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
