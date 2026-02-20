const jwt = require("jsonwebtoken");
const TokenBlacklist = require("../models/tokenBlacklist");

module.exports = async (req, res, next) => {
    try {
        const token = req.headers.authorization.split(" ")[1];
        
        // Check if token is blacklisted (logged out)
        const blacklistedToken = await TokenBlacklist.findOne({ token });
        if (blacklistedToken) {
            return res.status(401).json({ message: "Token has been revoked. Please login again." });
        }
        
        jwt.verify(token, process.env.JWT_SECRET);
        next();
    } catch (error) {
        res.status(401).json({ message: "Auth failed!"})
    }
};