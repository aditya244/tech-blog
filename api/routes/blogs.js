const express = require("express");
const Blog = require("../models/blog");
const router = express.Router();
const checkAuth = require("../middleware/check-auth");
const multer = require("multer");
const sharp = require('sharp')
const { put, list } = require('@vercel/blob');

async function uploadToVercelBlob(file) {
  console.log("Uploading file:", file.originalname);
  try {
    let compressedImageBuffer;

    if (file.mimetype === "image/png") {
      compressedImageBuffer = await sharp(file.buffer)
        .resize(800)
        .png({ quality: 80, compressionLevel: 9 })
        .toBuffer()
        .then((data) => {
          console.log("Image successfully compressed");
          return data;
        })
        .catch((err) => {
          console.error("Error during image compression", err);
          throw err;
        });
    } else {
      compressedImageBuffer = await sharp(file.buffer)
        .resize(800)
        .jpeg({ quality: 80 }) // convert to JPEG format with 80% quality
        .toBuffer()
        .then((data) => {
          console.log("Image successfully compressed");
          return data;
        })
        .catch((err) => {
          console.error("Error during image compression", err);
          throw err;
        });
    }
    const { url } = await put(file.originalname, compressedImageBuffer, {
      contentType: file.mimetype,
      access: "public",
      token:
        process.env.BLOB_READ_WRITE_TOKEN ||
        "vercel_blob_rw_tc8570i2Vby9yroW_pncNVPQkA3Ojf9mRGYiCdfjfmfRqXS",
    });
    console.log("Upload successful. URL:", url);
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
      const keywords = JSON.parse(req.body.keywords)
      if (isAdmin === "true") {
        const blogs = new Blog({
          title: req.body.title,
          content: req.body.content,
          tags: tags,
          imagePath: imageUrl,
          datePublished: req.body.datePublished,
          keywords: keywords,
          metaDescription: req.body.metaDescription,
          ogTitle: req.body.ogTitle,
          ogDescription: req.body.ogDescription
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
      const keywords = JSON.parse(req.body.keywords)
      // If a new file is uploaded, store it in Vercel Blob
      if (req.file) {
        const imageUrl = await uploadToVercelBlob(req.file);
        imagePath = imageUrl;
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
        imagePath: imagePath,
        keywords: keywords,
        metaDescription: req.body.metaDescription,
        ogTitle: req.body.ogTitle,
        ogDescription: req.body.ogDescription
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
  const pageSize = +req.query.pageSize || 5; // Default to 10 if not provided
  const currentPage = +req.query.page || 1; // Default to 1 if not provided

  // date is not in object format, so will need to convert it to date format so as to display in the correct format DD/MM/YYYY
  // refer to commented method at the bottom for conversion
  Blog.find()
    .sort( {datePublished: -1})
    .skip((currentPage - 1) * pageSize)
    .limit(pageSize)
    .then(blogs => {
      // const sortedBlogs = sortBlogsByPublishedDate(documents);
      return Blog.countDocuments().then(count => {
        res.status(200).json({
          message: "Blogs fetched Successfully",
          blogs: blogs,
          totalBlogs: count,
          pageSize: pageSize,
          currentPage: currentPage
        });
      });
    })
    .catch(error => {
      res.status(500).json({
        message: "Fetching blogs failed!"
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

// might need to use this logic on frontend for converting to the correct format to display
function convertToDateObject(dateString) {
  const parts = dateString.split('/');
  const formattedDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
  return new Date(formattedDate);
}

module.exports = router;
