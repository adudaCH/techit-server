const jwt = require("jsonwebtoken");
const router = require("../routes/register");
module.exports = (req, res, next) => {
    try {
        // get the token
        const token = req.header("Authorization");
        if (!token) res.status(401).send("Access denied. No token provided");
        // 2. take the payload
        req.payload = jwt.verify(token, process.env.JWTKEY);
        next();
    } catch (error) {
        res.status(400).send(error);
    }
};

