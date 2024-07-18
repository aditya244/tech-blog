const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
    // can retrieve the token from the queryparam as well from the url
    try {
        const token = req.headers.authorization.split(" ")[1];
        jwt.verify(token, "RANDOM_SECRET_TEXT_CHAR_JBKJBKBKJBKJB_HJBHUVTYDRTCGVHVBJHBJHBJHB");
        next();
    } catch (error) {
        res.status(401).json({ message: "Auth failed!"})
    }
};