const { verifyToken } = require("../utils/jwt.js");

const isAuth = (req, res, next) => {
    try {
        const token = req.cookies.token;
        if (!token) {
            return res.status(401).json({ error: 'Unauthorized: No token provided' });
        }
        const decoded = verifyToken(token);
        req.user = decoded;
        next();
    } catch (err) {
        console.error("Authentication error:", err);
        return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }
}

module.exports = {
    isAuth
}