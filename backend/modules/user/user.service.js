const prisma = require("../../config/prisma.js");
const {hashPassword} = require("../../utils/password.util.js");

const createUser = async (name, email, password) => {
    try {
        const hashedPassword = await hashPassword(password);
        const newUser = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword
            }
        })
        return newUser
    } catch(e) {
        console.error("Error creating user:", e)
    }
}

module.exports = {
    createUser
}