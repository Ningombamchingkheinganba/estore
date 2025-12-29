const jwt = require("jsonwebtoken");

const checktoken = async (req, res, next) => {
    try {
        const token = req.headers.authorization;

        if (!token) {
            return res.status(401).json({ message: "No token provided." });
        }
        
        await jwt.verify(token, "estore-secret-key");
        next(); //this simply hands off control to the next middleware or the api route handler
    } catch (error) {
        console.log("JWT verification failed:", error.message);
        res.status(401).json({ message: "Authorization failed!" });
    }
}

module.exports = checktoken;