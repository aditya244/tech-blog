const express = require("express");
const Blog = require("../models/blog");
const Comment = require("../models/comment");
const mongoose = require('mongoose');
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
        .resize(1000)
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
      token: process.env.BLOB_READ_WRITE_TOKEN,
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
    console.log("Received file:", req.file);
    console.log("Environment:", process.env.NODE_ENV);
    console.log(
      "BLOB_READ_WRITE_TOKEN set:",
      !!process.env.BLOB_READ_WRITE_TOKEN,
    );
    const isValid = MIME_TYPE_MAP[req.file.mimetype];
    if (!isValid) {
      return res.status(400).json({ message: "Invalid mime type" });
    }
    try {
      const imageUrl = await uploadToVercelBlob(req.file);
      const isAdmin = req.headers.isadmin.trim();
      const tags = JSON.parse(req.body.tags);
      const suggestedBlogIds = req.body.suggestedBlogIds
        ? JSON.parse(req.body.suggestedBlogIds)
        : [];
      const keywords = JSON.parse(req.body.keywords);
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
          ogDescription: req.body.ogDescription,
          suggestedBlogIds: suggestedBlogIds,
        });
        await blogs.save();
        res.status(201).json({
          message: "Post added successfully",
          blog: blogs,
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
        error: error.message,
      });
    }
  },
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
      const keywords = JSON.parse(req.body.keywords);
      const suggestedBlogIds = JSON.parse(req.body.suggestedBlogIds)
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
        ogDescription: req.body.ogDescription,
        suggestedBlogIds: suggestedBlogIds
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

router.get("/suggestedBlogs/:ids", (req, res, next) => {
  console.log(req.params.ids, 'suggestedBlogIds')
  let suggestedBlogIds = req.params.ids ? req.params.ids.split(',') : [];
  console.log(suggestedBlogIds, 'PARAMS');
  // Filter out any invalid ObjectId values to avoid CastError
  suggestedBlogIds = suggestedBlogIds.filter((id) => mongoose.Types.ObjectId.isValid(id));
  if (!suggestedBlogIds.length) {
    return res.status(400).json({ message: 'No valid suggested blog ids provided', blogs: [] });
  }

  Blog.find({ _id: { $in: suggestedBlogIds } })
    .then(blogs => {
      console.log(blogs, 'BLOGS')
      return res.status(200).json({
        message: 'Recommended blogs fetched',
        blogs: blogs
      })
    })
    .catch(error => {
      return res.status(500).json({
        error: error,
        message: 'Failed to fetch recommended blogs. Please visit the homepage to check more.'
      })
    })
})

router.get("/:id", (req, res, next) => {
  const id = req.params.id;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid blog id' });
  }

  Blog.findById(id).then((document) => {
    if (!document) {
      return res.status(404).json({ message: 'Blog not found' });
    }
    res.status(200).json({
      message: "Blog Post fetched successfully",
      blog: document,
    });
  }).catch(error => {
    res.status(500).json({ message: 'Failed to fetch blog', error: error.message });
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

// Add a new comment or admin reply
router.post('/comments', checkAuth, async (req, res, next) => {
  try {
    const { comment, blogId, parentCommentId, authorName, authorEmail } = req.body;
    const isAdmin = req.headers.isadmin === 'true';

    if (!comment || !blogId || !authorName || !authorEmail) {
      return res.status(400).json({ message: 'Missing required comment fields' });
    }

    const trimmedComment = comment.trim();
    if (trimmedComment.length === 0) {
      return res.status(400).json({ message: 'Comment cannot be empty or whitespace only' });
    }

    if (trimmedComment.length > 500) {
      return res.status(400).json({ message: 'Comment cannot exceed 500 characters' });
    }

    if (parentCommentId) {
      if (!isAdmin) {
        return res.status(403).json({ message: 'Only admin can add reply comments' });
      }

      const parentComment = await Comment.findById(parentCommentId);
      if (!parentComment) {
        return res.status(404).json({ message: 'Parent comment not found' });
      }

      if (parentComment.parentCommentId) {
        return res.status(400).json({ message: 'Replies to replies are not allowed' });
      }
    }

    const newComment = new Comment({
      comment: trimmedComment,
      blogId,
      dateOfPublish: new Date(),
      authorName,
      authorEmail,
      isAdmin,
      parentCommentId: parentCommentId || null,
    });

    await newComment.save();

    return res.status(201).json({ message: 'Comment added successfully', comment: newComment });
  } catch (error) {
    console.error('Error creating comment', error);
    return res.status(500).json({ message: 'Failed to create comment' });
  }
});

// Fetch comments for a blog
router.get('/comments/:blogId', async (req, res, next) => {
  try {
    const comments = await Comment.find({ blogId: req.params.blogId }).sort({ dateOfPublish: 1 });
    return res.status(200).json({ comments });
  } catch (error) {
    console.error('Error fetching comments', error);
    return res.status(500).json({ message: 'Failed to fetch comments' });
  }
});

// Delete a comment (admin only)
router.delete('/comments/:commentId', checkAuth, async (req, res, next) => {
  try {
    const isAdmin = req.headers.isadmin === 'true';
    if (!isAdmin) {
      return res.status(403).json({ message: 'Only admin can delete comments' });
    }

    const comment = await Comment.findById(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    await Comment.deleteOne({ _id: req.params.commentId });
    return res.status(200).json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Error deleting comment', error);
    return res.status(500).json({ message: 'Failed to delete comment' });
  }
});

// might need to use this logic on frontend for converting to the correct format to display
function convertToDateObject(dateString) {
  const parts = dateString.split('/');
  const formattedDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
  return new Date(formattedDate);
}

// Get likes count for a blog
router.get('/likes/:blogId', (req, res, next) => {
  try {
    Blog.findById(req.params.blogId).then((blog) => {
      if (!blog) {
        return res.status(404).json({ message: 'Blog not found' });
      }
      const likedBy = blog.likedBy || [];
      return res.status(200).json({
        message: 'Likes fetched successfully',
        likeCount: likedBy.length,
        likedBy: likedBy
      });
    }).catch((error) => {
      return res.status(500).json({ message: 'Failed to fetch likes', error: error.message });
    });
  } catch (error) {
    console.error('Error fetching likes:', error);
    return res.status(500).json({ message: 'Failed to fetch likes' });
  }
});

// Add a like to a blog
router.post('/likes/add', checkAuth, (req, res, next) => {
  try {
    const { blogId, userEmail } = req.body;

    if (!blogId || !userEmail) {
      return res.status(400).json({ message: 'Missing blogId or userEmail' });
    }

    Blog.findById(blogId).then((blog) => {
      if (!blog) {
        return res.status(404).json({ message: 'Blog not found' });
      }

      const likedBy = blog.likedBy || [];
      if (likedBy.includes(userEmail)) {
        return res.status(400).json({ message: 'User has already liked this blog' });
      }

      likedBy.push(userEmail);
      blog.likedBy = likedBy;

      return blog.save().then(() => {
        return res.status(200).json({
          message: 'Like added successfully',
          likeCount: likedBy.length
        });
      });
    }).catch((error) => {
      return res.status(500).json({ message: 'Failed to add like', error: error.message });
    });
  } catch (error) {
    console.error('Error adding like:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Remove a like from a blog
router.post('/likes/remove', checkAuth, (req, res, next) => {
  try {
    const { blogId, userEmail } = req.body;

    if (!blogId || !userEmail) {
      return res.status(400).json({ message: 'Missing blogId or userEmail' });
    }

    Blog.findById(blogId).then((blog) => {
      if (!blog) {
        return res.status(404).json({ message: 'Blog not found' });
      }

      const likedBy = blog.likedBy || [];
      const index = likedBy.indexOf(userEmail);
      if (index === -1) {
        return res.status(400).json({ message: 'User has not liked this blog' });
      }

      likedBy.splice(index, 1);
      blog.likedBy = likedBy;

      return blog.save().then(() => {
        return res.status(200).json({
          message: 'Like removed successfully',
          likeCount: likedBy.length
        });
      });
    }).catch((error) => {
      return res.status(500).json({ message: 'Failed to remove like', error: error.message });
    });
  } catch (error) {
    console.error('Error removing like:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
