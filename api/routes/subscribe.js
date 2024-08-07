const express = require("express");
const router = express.Router();
const SubscriptionDataSchema = require("../models/subscribe");

router.post("/subscribe", (req, res, next) => {
  const email= req.body.email.toLowerCase();
  SubscriptionDataSchema.findOne({ email: email })
    .then((existingEmail) => {
      if (existingEmail) {
        return res.status(401).json({
          message:
            "You are already a subscriber! If you are not receiving our emails, please contact us!",
          isHtml: true
        });
      }
      const subscriptionDetails = new SubscriptionDataSchema({
        email: req.body.email,
        subscriptionDate: req.body.date,
      });
        
      subscriptionDetails.save();
    })
    .then((result) => {
      return res.status(200).json({
        message: "Successfully Subscribed !",
        result: result,
      });
    })
    .catch((error) => {
      res.status(500).json({
        error: error,
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
