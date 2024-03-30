const express = require("express");
const router = express.Router();
const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

router.post("/sign-up", (req, res, next) => {
  bcrypt.hash(req.body.password, 10).then((hash) => {
    const user = new User({
      firstName: req.body.email,
      lastName: req.body.lastName,
      email: req.body.email,
      password: hash,
    });
    user
      .save()
      .then((result) => {
        res.status(201).json({
          message: "User Created!",
          result: result,
        });
      })
      .catch((err) => {
        res.status(500).json({
          error: err,
        });
      });
  });
});

router.post("/login", (req, res, next) => {
  console.log(req.body, "REQ_BODY");
  // checks if the email exists or not
  let userData;
  User.findOne({ email: req.body.email })
    .then((user) => {
      console.log(user, "USER");
      if (!user) {
        return res.status(401).json({
          message: "User does not exist!",
        });
      }
      userData = user;
      // compare method from bcrypt library compare if the password is correct or not
      return bcrypt.compare(req.body.password, user.password);
    })
    .then((result) => {
      // result comes as boolean after from the comparision method
      if (!result) {
        return res.status(401).json({
          message: "Incorrect password!",
        });
      }
      const token = jwt.sign(
        { email: userData.email, userId: userData._id },
        "RANDOM_SECRET_TEXT_CHAR_JBKJBKBKJBKJB_HJBHUVTYDRTCGVHVBJHBJHBJHB",
        { expiresIn: "1h" }
      );
      return res.status(200).json({
        token: token,
        expiresIn: 3600
      });
    })
    .catch((err) => {
      console.log(err, "ERROR");
      return res.status(401).json({
        message: "Auth failed",
      });
    });
});

module.exports = router;
