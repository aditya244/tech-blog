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


// router.post("/subscribe", (req, res, next) => {
//   const email= req.body.email.toLowerCase();
//   SubscriptionDataSchema.findOne({ email: email })
//     .then((existingEmail) => {
//       if (existingEmail) {
//         return res.status(401).json({
//           message:
//             "You are already a subscriber! If you are not receiving our emails, please contact us!",
//           isHtml: true
//         });
//       }
//       const subscriptionDetails = new SubscriptionDataSchema({
//         email: req.body.email,
//         subscriptionDate: req.body.date,
//       });
        
//       subscriptionDetails.save();
//     })
//     .then((result) => {
//       return res.status(200).json({
//         message: "Successfully Subscribed !",
//         result: result,
//       });
//     })
//     .catch((error) => {
//       res.status(500).json({
//         error: error,
//       });
//     });
// });

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
