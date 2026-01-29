const prisma = require("../../config/prisma.js");
const {hashPassword, comparePassword} = require("../../utils/password.util.js");

const createUser = async (username, email, password) => {
    try {
        const hashedPassword = await hashPassword(password);
        const newUser = await prisma.user.create({
            data: {
                username,
                email,
                password: hashedPassword
            }
        })
        return newUser
    } catch(e) {
        console.error("Error creating user:", e)
    }
}

const loginUser = async (email, password) => {
    const user = await prisma.user.findUnique({email});

    if (!user) {
        return null;
    }
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
        return null;
    }

    return user;
}

module.exports = {
    createUser,
    loginUser
}