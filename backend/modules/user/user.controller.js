const {createUser} = require('./user.service');

const registerUser = async (req, res) => {
    const {name, email, password} = req.body;
    try {
        const user = await createUser(name, email, password);
        if (!user) {
            return res.status(400).json({error: 'User registration failed'});
        }
        res.status(201).json(user);
    } catch (e) {
        res.status(500).json({error: 'Failed to register user'});
    } 
}

module.exports = {
    registerUser
}