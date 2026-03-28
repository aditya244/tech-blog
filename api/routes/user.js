const express = require("express");
const router = express.Router();
const User = require("../models/user");
const checkAuth = require("../middleware/check-auth");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const axios = require("axios");

const CLIENT_URL = process.env.CLIENT_URL;

const generateAuthResponse = (user) => {
  const token = jwt.sign(
    { email: user.email, userId: user._id },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );

  return {
    token,
    expiresIn: 3600,
    isAdmin: user.isAdmin,
    email: user.email,
    firstName: user.firstName,
    readingList: user.readingList,
    authProviders: user.authProviders
  };
};

router.post("/sign-up", (req, res, next) => {
  // add the logic to check if the userId already exist
  // emailId has to be unique
  User.findOne({email: req.body.email})
    .then((user) => {
      if(user) {
        return res.status(401).json({
          message: 'User id already exists. Please login!'
        }) 
      } else {
        bcrypt.hash(req.body.password, 10).then((hash) => {
          const user = new User({
            firstName: req.body.firstName,
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
      }
    })
    .catch((err) => {
      res.status(500).json({
        message: 'An error occurred while checking email existence.',
        error: err
      });
    });
});

router.post("/login", (req, res, next) => {
  // checks if the email exists or not
  console.log(req.body, 'BODY')
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
      if (userData) {
        const token = jwt.sign(
          { email: userData.email, userId: userData._id },
          process.env.JWT_SECRET,
          { expiresIn: "1h" }
        );
        return res.status(200).json({
          token: token,
          expiresIn: 3600,
          isAdmin: userData.isAdmin,
          email: userData.email,
          firstName: userData.firstName,
          readingList: userData.readingList
        });
      }
    })
    .catch((err) => {
      console.log(err, "ERROR");
      return res.status(500).json({
        message: "Auth failed",
      });
    });
});

// check for all the error handling in this route
router.post("/login-with-google", async (req, res) => {
  try {
    const { email, firstName, lastName, googleId } = req.body;
    const provider = "google";

    let user = await User.findOne({ email });

    // 🧠 Case 1: New user
    if (!user) {
      user = new User({
        firstName,
        lastName,
        email,
        googleId,
        authProviders: [provider],
      });

      await user.save();
    } else {
      // 🧠 Case 2: Existing user → link Google

      if (!user.googleId) {
        user.googleId = googleId;
      }

      if (!user.authProviders) {
        user.authProviders = [];
      }

      if (!user.authProviders.includes(provider)) {
        user.authProviders.push(provider);
      }

      await user.save();
    }

    return res.status(200).json(generateAuthResponse(user));

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Google login failed",
    });
  }
});

router.post("/login-with-github", async (req, res) => {

  console.log(req.body, 'req body from login with git')
  try {
    const { email, firstName, lastName, githubId, avatar } = req.body;
    const provider = "github";

    let user = await User.findOne({ email });

    // 🧠 Case 1: New user
    if (!user) {
      user = new User({
        firstName,
        lastName,
        email,
        githubId,
        authProviders: [provider],
      });

      await user.save();
    } else {
      // 🧠 Case 2: Existing user → link GitHub

      if (!user.githubId) {
        user.githubId = githubId;
      }

      if (!user.authProviders) {
        user.authProviders = [];
      }

      if (!user.authProviders.includes(provider)) {
        user.authProviders.push(provider);
      }

      await user.save();
    }

    return res.status(200).json(generateAuthResponse(user));

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "GitHub login failed",
    });
  }
});

router.get("/github/callback", async (req, res) => {
  const code = req.query.code;
  console.log(code, 'code from callback')
  console.log(process.env.GITHUB_CLIENT_ID, 'github client id')
  try {
    // Step 1: get access token
    const tokenRes = await axios.post(
      "https://github.com/login/oauth/access_token",
      {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      },
      { headers: { Accept: "application/json" } }
    );

    const accessToken = tokenRes.data.access_token;

    console.log(accessToken, 'accessToken')

    // Step 2: get user profile
    const userRes = await axios.get("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const emailRes = await axios.get("https://api.github.com/user/emails", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const primaryEmail = emailRes.data.find(e => e.primary)?.email;

    const userData = {
      email: primaryEmail,
      firstName: userRes.data.name || userRes.data.login,
      lastName: "",
      githubId: userRes.data.id,
      avatar: userRes.data.avatar_url,
    };

    // Step 3: redirect to frontend with data
    res.redirect(
      `http://localhost:4200/github-success?data=${encodeURIComponent(JSON.stringify(userData))}`
    );

  } catch (err) {
    console.error(err);
    res.redirect("http://localhost:4200/login");
  }
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

router.post("/remove-from-reading-list",  (req, res, next) => {
  const { userEmailId, blogId } = req.body;

  User.findOneAndUpdate(
    { email: userEmailId },
    { $pull: { readingList: blogId } },
    { new: true } // to return the updated document
  )
  .then((user) => {
    if (user) {
      return res.status(200).json({
        message: 'Successfully removed from reading list',
        updatedReadingList: user.readingList // optional: return updated reading list
      });
    } else {
      return res.status(401).json({
        message: 'This blog does not exist in the reading list'
      });
    }
  })
  .catch((err) => {
    return res.status(500).json({
      message: 'Remove from the reading list failed'
    });
  });
});

// Logout endpoint kept for compatibility but performs no server-side blacklist (handled on frontend)
router.post("/logout", checkAuth, async (req, res) => {
  // No-op: frontend handles logout locally to conserve API calls on limited plans
  return res.status(200).json({ message: "Logout acknowledged" });
});

module.exports = router;
