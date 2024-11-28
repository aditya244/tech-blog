const express = require("express");
const router = express.Router();
const SubscriptionDataSchema = require("../models/subscribe");
const transporter = require('../middleware/mailer'); 

router.post("/subscribe", (req, res, next) => {
  const email = req.body.email.toLowerCase();

  //// logging for transporter
  console.log('Attempting Email Send', {
    host: transporter.options.host,
    port: transporter.options.port,
    user: process.env.EMAIL_USER?.substring(0, 3) + '***', // Partial masking
    environment: process.env.NODE_ENV
  });
  //////
  
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
        subject: 'Welcome to Debugtek!',
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body {
                  font-family: Arial, sans-serif;
                  margin: 0;
                  padding: 0;
                  background-color: #f9f9f9;
                  color: #333;
                }
                .container {
                  max-width: 600px;
                  margin: 20px auto;
                  background-color: #ffffff;
                  border-radius: 8px;
                  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                  overflow: hidden;
                }
                .header {
                  background-color: #25303B;
                  color: #ffffff;
                  padding: 30px;
                  text-align: center;
                }
                .header h1 {
                  margin: 0;
                  font-size: 24px;
                }
                .content {
                  padding: 20px;
                }
                .content p {
                  line-height: 1.6;
                }
                .footer {
                  background-color: #f1f1f1;
                  text-align: center;
                  padding: 10px;
                  font-size: 14px;
                  color: #666;
                }
                .footer a {
                  color: #007BFF;
                  text-decoration: none;
                }
                .footer a:hover {
                  text-decoration: underline;
                }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>Thank You for Subscribing!</h1>
                </div>
                <div class="content">
                  <p>Hi there,</p>
                  <p>We're excited to have you as part of the Debugtek community! You've successfully subscribed to our blog, and we can't wait to share valuable insights, updates, and more with you.</p>
                  <p>Stay tuned for the latest updates right in your inbox.</p>
                  <p>If you have any questions or feedback, feel free to <a href="mailto:info@debugtek.com">reach out</a>.</p>
                  <p>Cheers,</p>
                  <p>The Debugtek Team</p>
                </div>
                <div class="footer">
                  <p>&copy; 2024 Debugtek. All rights reserved.</p>
                  <p><a href="https://debugtek.com">Visit our website</a></p>
                </div>
              </div>
            </body>
          </html>
        `,
      };
      // const mailOptions = {
      //   from: 'debugtek <info@debugtek.com>',
      //   to: email,
      //   subject: 'Thank you for subscribing!',
      //   text: 'You have successfully subscribed to our blog. Stay tuned for updates!',
      // };
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