const {createUser} = require('./user.service');

const registerUser = async (req, res) => {
    try {
        const {username, email, password} = req.body;
        const user = await createUser(username, email, password);
        if (!user) {
            return res.status(400).json({error: 'User registration failed'});
        }
        res.status(201).json(user);
    } catch (e) {
        res.status(500).json({error: 'Failed to register user'});
    } 
}

const loginUser = async (req, res) => {
    try{
        const {email, password} = req.body;
        const user = await loginUser(email, password);
        if (!user) {
            return res.status(401).json({error: 'Invalid email or password'});
        }
    } catch (e) {

    }
}

module.exports = {
    registerUser,
    loginUser
}