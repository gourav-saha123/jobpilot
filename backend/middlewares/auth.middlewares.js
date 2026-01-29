const prisma = require("../../config/prisma.js");
const {hashPassword, comparePassword} = require("../../utils/password.util.js");
const {generateToken, verifyToken} = require("../utils/jwt.js")

const isAuth = (req, res, next) => {
    const {email, password} = req.body;
    
}