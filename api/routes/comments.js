const express = require('express');
const Comment = require('../models/comment');
const router = express.Router();
const checkAuth = require('../middleware/check-auth');

// Add a new comment or admin reply
router.post('', checkAuth, async (req, res, next) => {
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
router.get('/:blogId', async (req, res, next) => {
  try {
    const comments = await Comment.find({ blogId: req.params.blogId }).sort({ dateOfPublish: 1 });
    return res.status(200).json({ comments });
  } catch (error) {
    console.error('Error fetching comments', error);
    return res.status(500).json({ message: 'Failed to fetch comments' });
  }
});

// Delete a comment (admin only)
router.delete('/:commentId', checkAuth, async (req, res, next) => {
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

module.exports = router;
