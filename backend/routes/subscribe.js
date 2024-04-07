const express = require("express");
const router = express.Router();
const SubscriptionDataSchema = require("../models/subscribe");

router.post("/subscribe", (req, res, next) => {
  console.log(req.body, "REQ, SUBS");

  SubscriptionDataSchema.findOne({ email: req.body.email })
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
      res.status(201).json({
        message: "Successfully Subscribed",
        result: result,
      });
    })
    .catch((error) => {
      res.status(500).json({
        error: error,
      });
    });
});

module.exports = router;
