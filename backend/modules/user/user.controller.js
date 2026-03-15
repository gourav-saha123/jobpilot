const {createUser, followUser, unfollowUser, getAllFollowers, getProfile} = require('./user.service');
const {comparePassword} = require("../../utils/password.util.js");
const {generateToken} = require('../../utils/jwt.js');

const registerUser = async (req, res) => {
    try {
        const {username, email, password} = req.body;
        const u = await prisma.user.findUnique({where: {email}});
        if (u) {
            return res.status(400).json({error: 'Email already in use'});
        }
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
    console.log("Login request received:", req.body);
    try{
        const user = await prisma.user.findUnique({where: {email: req.body.email}});
        console.log("Login request processing for user:", user);
        if (!user) {
            return res.status(400).json({error: 'Invalid email or password'});
        }

        const isPasswordValid = await comparePassword(req.body.password, user.password);
        console.log("Password validation result:", isPasswordValid);
        if (!isPasswordValid) {
            return res.status(400).json({error: 'Invalid email or password'});
        }

        const token = generateToken({id: user.id, email: user.email});
        res.cookie('token', token, {
            maxAge : 3*24*60*60*1000,
            httpOnly: true
        });
        return res.status(200).json({message: 'Login successful', token});
        
    } catch (e) {
        console.error("Error during login:", e);
        res.status(500).json({error: 'Login failed'});
    }
}

const getUserProfile = async (req, res) => {
  try {
    const username = req.params.username;
    const profile = await getProfile(username);
    if (!profile) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json(profile);
  } catch (e) {
    console.error("Error fetching user profile:", e);
    res.status(500).json({ error: "Failed to fetch user profile" });
  }
};

const getAllFollowersController = async (req, res) => {
    try {
        const username = req.params.username;
        const followers = await getAllFollowers(username);
        res.status(200).json(followers);
    } catch (e) {
        console.error("Error fetching followers:", e);
        res.status(500).json({ error: "Failed to fetch followers" });
    }
};

const followUserController = async (req, res) => {
    try {
        const followerUsername = req.user.username; 
        const followingUsername = req.params.username;
        const follow = await followUser(followerUsername, followingUsername);
        res.status(200).json(follow);
    } catch (e) {
        console.error("Error following user:", e);
        res.status(500).json({ error: "Failed to follow user" });
    }
};

const unfollowUserController = async (req, res) => {
    try {
        const followerUsername = req.user.username; 
        const followingUsername = req.params.username;
        const unfollow = await unfollowUser(followerUsername, followingUsername);
        res.status(200).json(unfollow);
    } catch (e) {
        console.error("Error unfollowing user:", e);
        res.status(500).json({ error: "Failed to unfollow user" });
    }
};

const logout = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
  });
  return res.status(200).json({ message: "Logged out successfully" });
};

module.exports = {
    registerUser,
    loginUser,
    logout,
    getUserProfile,
    getAllFollowersController,
    followUserController,
    unfollowUserController
}