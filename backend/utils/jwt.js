const jwt = require('jsonwebtoken');
require('dotenv').config();

const generateToken = (payload) => {
    return jwt.sign(payload, process.env.SECRET_KEY, { expiresIn: '72h' });
}

const verifyToken = (token) => {
    try {
        return jwt.verify(token, process.env.SECRET_KEY);   
    } catch (e) {
        console.error("Invalid token:", e);
        return null;
    }
}

module.exports = {
    generateToken,
    verifyToken
}