const express = require("express");
const Blog = require("../models/blog");
const router = express.Router();
const checkAuth = require("../middleware/check-auth");
const multer = require("multer");

const { put, list } = require('@vercel/blob');

async function uploadToVercelBlob(file) {
  console.log('Uploading file:', file.originalname);
  try {
    const { url } = await put(file.originalname, file.buffer, {
      contentType: file.mimetype,
      access: 'public',
      token: process.env.BLOB_READ_WRITE_TOKEN || 'vercel_blob_rw_tc8570i2Vby9yroW_pncNVPQkA3Ojf9mRGYiCdfjfmfRqXS'
    });
    console.log('Upload successful. URL:', url);
    return url;
  } catch (error) {
    console.error("Error uploading to Vercel Blob:", error);
    throw new Error("Failed to upload image");
  }
}

const MIME_TYPE_MAP = {
  'image/png': 'png',
  'image/jpeg': 'jpeg',
  'image/jpg': 'jpg'
}

// existing code for using local storage

// const storage = multer.diskStorage({
//   destination: (req, file, callBack) => {
//     const isValid = MIME_TYPE_MAP[file.mimetype];
//     let error  =  new Error("Invalid mime type")
//     if (isValid) {
//       error = null;
//     }
//     callBack(error, "api/images");
//   },
//   filename: (req, file, callBack) => {
//     const name = file.originalname.toLowerCase().split('').join('-');
//     const ext = MIME_TYPE_MAP[file.mimetype];
//     callBack(null, name + '-' + Date.now() + '.' + ext);
//   }
// });

// router.post(
//   "",
//   checkAuth,
//   multer({storage: storage}).single("image"),
//   (req, res, next) => {
//     const url = req.protocol + '://' + req.get("host");
//     console.log(req.body, 'REQ')
//     const isAdmin = req.headers.isadmin.trim();
//     const tags = JSON.parse(req.body.tags)
//     if (isAdmin === "true") {
//       const blogs = new Blog({
//         title: req.body.title,
//         content: req.body.content,
//         tags: tags,
//         imagePath: url + "/images/" + req.file.filename,
//         datePublished: req.body.datePublished
//       });
//       blogs
//         .save()
//         .then((result) => {
//           res.status(201).json({
//             message: "Post added successfully",
//           });
//         })
//         .catch((error) => {
//           console.log(error, 'Error on post blog')
//           res.status(500).json({
//             message: "An error occured while saving the blog post.",
//           });
//         });
//     } else {
//       return res.status(403).json({
//         message: "You do not have rights to perform this action.",
//       });
//     }
//   }
// );

// router.put(
//   "/edit-blog/:id",
//   multer({ storage: storage }).single("image"),
//   (req, res, next) => {
//     console.log(req.file, "REQ_EDIT");
//     console.log(req.body, 'REQ_BODY')
//     let imagePath = req.body.imagePath;
//     const tags = JSON.parse(req.body.tags)
//     console.log(tags)
//     if(req.file) {
//       const url = req.protocol + '://' + req.get("host");
//       imagePath = url + "/images/" + req.file.filename
//     }
//     console.log(imagePath, 'imagePath')
//     const blog = new Blog({
//       _id: req.params.id,
//       title: req.body.title,
//       content: req.body.content,
//       tags: tags,
//       imagePath: imagePath
//     });
//     Blog.updateOne({ _id: req.params.id }, blog).then((result) => {
//       console.log(result);
//       res.status(200).json({ message: "Blog Updated Successfully" });
//     });
//   }
// );

//



// new code from claude
// replaced to use vercel blob

router.post(
  "",
  checkAuth,
  multer({ storage: multer.memoryStorage() }).single("image"),
  async (req, res, next) => {
    console.log('Received file:', req.file);
    console.log('Environment:', process.env.NODE_ENV);
    console.log('BLOB_READ_WRITE_TOKEN set:', !!process.env.BLOB_READ_WRITE_TOKEN)
    const isValid = MIME_TYPE_MAP[req.file.mimetype];
    if (!isValid) {
      return res.status(400).json({ message: "Invalid mime type" });
    }
    try {
      const imageUrl = await uploadToVercelBlob(req.file);
      const isAdmin = req.headers.isadmin.trim();
      const tags = JSON.parse(req.body.tags);
      if (isAdmin === "true") {
        const blogs = new Blog({
          title: req.body.title,
          content: req.body.content,
          tags: tags,
          imagePath: imageUrl,
          datePublished: req.body.datePublished,
        });
        await blogs.save();
        res.status(201).json({
          message: "Post added successfully",
          blog: blogs
        });
      } else {
        res.status(403).json({
          message: "You do not have rights to perform this action.",
        });
      }
    } catch (error) {
      console.error("Error on post blog:", error);
      res.status(500).json({
        message: "An error occurred while saving the blog post.",
        error: error.message
      });
    }
  }
);

router.put(
  "/edit-blog/:id",
  checkAuth, // Assuming you want to keep the authentication middleware
  multer({ storage: multer.memoryStorage() }).single("image"),
  async (req, res, next) => {
    try {
      console.log(req.file, "REQ_EDIT");
      console.log(req.body, 'REQ_BODY');

      let imagePath = req.body.imagePath;
      const tags = JSON.parse(req.body.tags);
      console.log(tags);

      // If a new file is uploaded, store it in Vercel Blob
      if (req.file) {
        const { url } = await put(req.file.originalname, req.file.buffer, {
          contentType: req.file.mimetype,
          access: 'public',
        });
        imagePath = url;

        // If there was an old image, you might want to delete it
        if (req.body.oldImagePath) {
          // Extract the pathname from the old image URL
          const oldImagePathname = new URL(req.body.oldImagePath).pathname;
          await del(oldImagePathname);
        }
      }

      console.log(imagePath, 'imagePath');

      const updatedBlog = {
        title: req.body.title,
        content: req.body.content,
        tags: tags,
        imagePath: imagePath
      };

      const result = await Blog.findByIdAndUpdate(req.params.id, updatedBlog, { new: true });

      if (!result) {
        return res.status(404).json({ message: "Blog not found" });
      }

      res.status(200).json({ message: "Blog Updated Successfully", blog: result });
    } catch (error) {
      console.error("Error updating blog:", error);
      res.status(500).json({
        message: "An error occurred while updating the blog post.",
        error: error.message
      });
    }
  }
);

router.get("", (req, res, next) => {
  Blog.find().then((documents) => {
    const sortedBlogs = sortBlogsByPublishedDate(documents);
    res.status(200).json({
      message: "Blogs fetched Successfully",
      blogs: sortedBlogs,
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
  console.log(req.params.ids, 'PARAMS');
  console.log(blogIds, 'BLOGIDS') 
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

function convertToDateObject(dateString) {
  const parts = dateString.split('/');
  const formattedDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
  return new Date(formattedDate);
}

function sortBlogsByPublishedDate(blogsArray) {
  return blogsArray.sort((a, b) => {
    const dateA = convertToDateObject(a.datePublished);
    const dateB = convertToDateObject(b.datePublished);
    return dateB - dateA;
  });
}

module.exports = router;
