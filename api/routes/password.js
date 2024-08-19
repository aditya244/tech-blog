const express = require("express");
const router = express.Router();
const transporter = require("../middleware/mailer");
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

router.post("/forgot-password", async (req, res) => {
  console.log(req.body, "REQ_FORGOT");
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }
    console.log(user.authProvider, 'auth')
    console.log(user)
    if (user && user.authProvider === "google") {
      return res
        .status(400)
        .send({
          message:
            "This account is linked with Google. Please use Google to sign in.",
        });
    }

    // Generate a reset token and set expiration (e.g., 1 hour)
    const token = jwt.sign(
      { email },
      "RANDOM_SECRET_TEXT_CHAR_JBKJBKBKJBKJB_HJBHUVTYDRTCGVHVBJHBJHBJHB",
      { expiresIn: "1h" }
    );
    user.resetToken = token;
    user.resetTokenExpiration = Date.now() + 3600000; // 1 hour from now
    await user.save();

    //const resetLink = `http://localhost:4200/reset-password?token=${token}`;
    const resetLink = `${process.env.APIURL}/password/reset-password?token=${token}`;
    const mailOptions = {
      from: "debugtek <info@debugtek.com>",
      to: email,
      subject: "Password Reset",
      text: `Click here to reset your password: ${resetLink}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Email sending error:", error);
        return res.status(500).send({ message: "Failed to send email" });
      }
      res.send({ message: "Password reset link sent to your email" });
    });
  } catch (error) {
    res.status(500).send({ message: "An error occurred" });
  }
});

router.post("/reset-password", async (req, res) => {
  const { token, password } = req.body;

  console.log(token, password);
  try {
    // Verify the token using the same secret
    const decoded = jwt.verify(
      token,
      "RANDOM_SECRET_TEXT_CHAR_JBKJBKBKJBKJB_HJBHUVTYDRTCGVHVBJHBJHBJHB"
    );
    console.log("Decoded Token:", decoded);
    const user = await User.findOne({
      email: decoded.email,
      resetToken: token,
      resetTokenExpiration: { $gt: Date.now() },
    });
    console.log(user, 'USER')
    if (!user) {
      return res.status(400).send({ message: "Invalid or expired token" });
    }

    // Hash the new password and save it
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log(hashedPassword, 'HASHEDPWD')
    user.password = hashedPassword;
    user.resetToken = undefined;
    user.resetTokenExpiration = undefined;
    await user.save();

    res.send({ message: "Password has been successfully reset" });
  } catch (error) {
    res.status(400).send({ message: "Invalid or expired token" });
  }
});

module.exports = router;
