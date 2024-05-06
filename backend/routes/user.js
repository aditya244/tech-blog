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
        email: userData.email,
        firstName: userData.firstName
      });
    })
    .catch((err) => {
      console.log(err, "ERROR");
      return res.status(401).json({
        message: "Auth failed",
      });
    });
});

// check for all the error handling in this route
router.post("/login-with-google", (req, res, next) => {
  let userData;
  console.log(req.body, 'REQ');
  User.findOne({ email: req.body.email })
    .then((user) => {
      console.log(user, "USER");

      // logic for sign up
      if (!user) {
        console.log('inside sign up');
        // sign up the user
        const newUser = new User({
          firstName: req.body.firstName,
          lastName: req.body.lastName,
          email: req.body.email,
          password: 'password_123'
        });
        newUser
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
        //return newUser.save(); // return the promise chain
      } else {
        userData = user;
        const token = jwt.sign(
          { email: userData.email, userId: userData._id },
          "RANDOM_SECRET_TEXT_CHAR_JBKJBKBKJBKJB_HJBHUVTYDRTCGVHVBJHBJHBJHB",
          { expiresIn: "1h" }
        );
        console.log("user login");
        return res.status(200).json({
          token: token,
          expiresIn: 3600,
          isAdmin: userData.isAdmin,
          email: userData.email,
          firstName: userData.firstName
        });
      }
    })
    .catch((err) => { // handle errors in the entire promise chain
      console.error(err);
      return res.status(500).json({
        mesaage: err, // return error message
      });
    });
});

router.post("/add-reading-list",  (req, res, next) => {
  console.log(req.body.userEmailid, 'REQ')
  User.findOne({ email: req.body.userEmailid })
    .then((user) => {
      console.log(user, 'USER')
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
      if (!user.readingList || user.readingList.length === 0) {
        return res.status(200).json({
          message: 'Reading List is empty'
        });
      }
      return res.status(200).json({
        readingList: user.readingList,
        message: 'Reading List fetched'
      })
    })
})

module.exports = router;
