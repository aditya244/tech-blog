const express = require("express");
const router = express.Router();
const SubscriptionDataSchema = require("../models/subscribe");
const transporter = require('../middleware/mailer'); 
const { Resend } = require("resend");
const resend = new Resend(process.env.RESEND_API_KEY);

router.post("/subscribe", async (req, res) => {
  try {
    const email = req.body.email.toLowerCase();

    const existingEmail = await SubscriptionDataSchema.findOne({ email });

    if (existingEmail) {
      return res.status(401).json({
        message:
          "You are already a subscriber! If you are not receiving our emails, please contact us!",
        isHtml: true,
      });
    }

    await SubscriptionDataSchema.create({
      email,
      subscriptionDate: req.body.date,
    });

    // ✅ Send email FIRST
    const payload = {
      from: "Debugtek <info@debugtek.com>",
      to: email,
      subject: "Welcome to Debugtek!",
      replyTo: "sinha.aditya244@gmail.com",
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
                <p>I am excited to have you as part of the Debugtek community! You've successfully subscribed to the blog, and I can't wait to share valuable insights, updates, and more with you.</p>
                <p>Stay tuned for the latest updates right in your inbox.</p>
                <p>If you have any questions or feedback, feel free to <a href="mailto:info@debugtek.com">reach out</a>.</p>
                <p>Cheers,</p>
                <p>Aditya Sinha, Debugtek</p>
              </div>
              <div class="footer">
                <p>&copy; 2026 Debugtek. All rights reserved.</p>
                <p><a href="https://debugtek.com">Visit our website</a></p>
              </div>
            </div>
          </body>
        </html>
      `,
    };
    console.log("EMAIL PAYLOAD:", payload);
    const response = await resend.emails.send(payload);

    console.log("RESEND RESPONSE:", response);
    // ✅ Then send response
    return res.status(200).json({
      message: "Successfully Subscribed!",
    });

  } catch (error) {
    console.error("Subscription error:", error);
    return res.status(500).json({
      error: "Something went wrong",
    });
  }
});

router.post("/contact", async (req, res) => {
  try {
    const { title, name, email, message } = req.body;

    if (!title || !name || !email || !message) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    const payload = {
      from: "Debugtek <info@debugtek.com>",
      to: process.env.EMAIL_ADMIN,
      subject: `[Contact Us] ${title}`,
      replyTo: email,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <h2>New Contact Request</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Title:</strong> ${title}</p>
          <p><strong>Message:</strong></p>
          <div style="white-space: pre-wrap; padding: 10px; background: #f7f7f7; border-radius: 6px;">${message}</div>
        </div>
      `,
    };

    console.log("CONTACT EMAIL PAYLOAD:", payload);
    const response = await resend.emails.send(payload);
    console.log("CONTACT EMAIL RESPONSE:", response);

    return res.status(200).json({
      message: "Your message has been sent successfully. Thank you for reaching out!",
    });
  } catch (error) {
    console.error("Contact error:", error);
    return res.status(500).json({
      message: "Unable to send contact message. Please try again later.",
    });
  }
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