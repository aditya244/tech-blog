const express = require("express");
const router = express.Router();
const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

router.post("/sign-up", (req, res, next) => {
  // add the logic to check if the userId already exist
  // emailId has to be unique
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
  // checks if the email exists or not
  let userData;
  User.findOne({ email: req.body.email })
    .then((user) => {
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
        expiresIn: 3600,
        isAdmin: userData.isAdmin,
        email: userData.email
      });
    })
    .catch((err) => {
      console.log(err, "ERROR");
      return res.status(401).json({
        message: "Auth failed",
      });
    });
});

router.post("/add-reading-list",  (req, res, next) => {
  User.findOne({ email: req.body.userEmailid })
    .then((user) => {
      if (!user.readingList.includes(req.body.blogId)) {
        user.readingList.push(req.body.blogId)
        user.save()
        return res.status(200).json({
          message: 'Successfully added to reading list'
        })
      }
      return res.status(401).json({
        mesaage: 'This blog already exists in the reading list'
      })
    })
    .catch((err) => {
      return res.status(401).json({
        message: 'Add to reading list failed'
      })
    })
  
})

router.get("/reading-list/:emailId", (req, res, next) => {
  User.findOne({ email: req.params.emailId })
    .then((user) => {
      if (!user) {
        return res.status(401).json({
          message: 'You are not signed in.'
        })
      }
      return res.status(200).json({
        readingList: user.readingList,
        message: 'Reading List fetched'
      })
    })
})

module.exports = router;
