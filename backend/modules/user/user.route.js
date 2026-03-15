const express = require('express');

const {registerUser, loginUser, logout, followUserController, unfollowUserController, getUserProfile, getAllFollowersController} = require('./user.controller');
const {isAuth} = require('../../middlewares/auth.middlewares.js');

const router = express.Router();

router.post('/register', registerUser);
router.get('/profile/:username', getUserProfile);
router.get('/followers/:username', getAllFollowersController);
router.post('/follow/:username', isAuth, followUserController);
router.delete('/unfollow/:username', isAuth, unfollowUserController);
router.post('/login', loginUser);
router.delete('/logout', isAuth, logout);


module.exports = router;