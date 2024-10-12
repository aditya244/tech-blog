const express = require("express");
const router = express.Router();
const SubscriptionDataSchema = require("../models/subscribe");
const transporter = require('../middleware/mailer'); 

router.post("/subscribe", (req, res, next) => {
  const email = req.body.email.toLowerCase();

  SubscriptionDataSchema.findOne({ email: email })
    .then((existingEmail) => {
      if (existingEmail) {
        return res.status(401).json({
          message:
            "You are already a subscriber! If you are not receiving our emails, please contact us!",
          isHtml: true,
        });
      }

      const subscriptionDetails = new SubscriptionDataSchema({
        email: email,
        subscriptionDate: req.body.date,
      });
      console.log(subscriptionDetails, 'subscriptionDetails')
      return subscriptionDetails.save(); // Return the promise to chain the next .then
    })
    .then((result) => {
      if (!result) return; // If the save didn't happen (due to an existing email), exit early

      // Send email after successfully saving the subscription
      const mailOptions = {
        from: 'debugtek <info@debugtek.com>',
        to: email,
        subject: 'Thank you for subscribing!',
        text: 'You have successfully subscribed to our blog. Stay tuned for updates!',
      };
      console.log(email, 'email')
      return transporter.sendMail(mailOptions); // Return the sendMail promise to chain .then
    })
    .then((info) => {
      if (!info) return; // If sendMail didn't happen, exit early

      return res.status(200).json({
        message: "Successfully Subscribed!",
      });
    })
    .catch((error) => {
      console.error('Error occurred:', error);
      res.status(500).json({
        error: error.message || 'An unexpected error occurred',
      });
    });
});

router.get("/get-subscription-updates/:email", (req, res, next) => {
  SubscriptionDataSchema.findOne({email: req.params.email})
    .then((existingEmail) => {
      if(existingEmail) {
        return res.status(200).json({
          message: 'Already subscribed',
          subscriptionStatus: true
        })
      } else {
        return res.status(200).json({
          message: 'Not a subscriber',
          subscriptionStatus: false
        })
      }
    })
    .catch(err => {
      return res.status(500).json({
        error: err.message
      })
    })
})


module.exports = router;


// comment.js file backup

// const express = require("express");
// const Comment = require('../models/comment');
// const router = express.Router();
// const checkAuth = require("../middleware/check-auth");

// router.post("", checkAuth, (req, res, next) => {
//     const comments = new Comment({
//         comment: req.body.comment,
//         blogId: req.body.blogId,
//         dateOfPublish: req.body.dateOfPublish
//     });
//     console.log(req.body)
//     comments.save();
//     res.status(201).json({
//         message: 'Comment added successfully'
//     })
// })

// router.get('/:blogId', (req, res, next) => {
//     Comment.find({blogId:req.params.blogId}).then(documents => {
//         res.status(200).json({
//             message: 'Comments fetched succesfully',
//             comments: documents
//         })
//     })
// })

// router.delete('/:commentId', checkAuth, (req, res, next) => {
//     Comment.deleteOne({_id: req.params.commentId}).then(result => {
//         console.log(result);
//         res.status(200).json({
//             message: 'Comment deleted successfully'
//         })
//     })
// })

// module.exports = router;