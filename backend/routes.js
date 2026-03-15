const express = require('express');
const userRoutes = require('./modules/user/user.route');
const postRoutes = require('./modules/post/post.route');

const router = express.Router();

router.use('/user', userRoutes);
router.use('/post', postRoutes);

module.exports = router;