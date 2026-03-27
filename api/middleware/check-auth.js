// const jwt = require("jsonwebtoken");

// module.exports = (req, res, next) => {
//     // can retrieve the token from the queryparam as well from the url
//     try {
//         const token = req.headers.authorization.split(" ")[1];
//         jwt.verify(token, process.env.JWT_SECRET);
//         next();
//     } catch (error) {
//         res.status(401).json({ message: "Auth failed!"})
//     }
// };

const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {

  // 🔥 1. Skip preflight requests
  if (req.method === "OPTIONS") {
    return next();
  }

  try {
    // 🔥 2. Check if header exists
    if (!req.headers.authorization) {
      return res.status(401).json({ message: "Auth failed!" });
    }

    const token = req.headers.authorization.split(" ")[1];

    jwt.verify(token, process.env.JWT_SECRET);

    next();

  } catch (error) {
    res.status(401).json({ message: "Auth failed!" });
  }
};