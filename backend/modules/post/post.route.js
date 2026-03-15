const express = require('express');
const router = express.Router();
const postController = require('./post.controller');
const {isAuth} = require('../../middlewares/auth.middlewares');

// Route to create a new post
router.post('/create', isAuth, postController.createPost);

// Route to get all posts
router.get('/posts', isAuth, postController.getPosts);

// Route to get a single post by ID
router.get('/allposts', isAuth, postController.getAllPostsByUsername);

// Route to update a post by ID
router.put('/update', isAuth, postController.updatePost);

// Route to delete a post by ID
router.delete('/delete', isAuth, postController.deletePost);

// Route to like a post by ID
router.post('/like', isAuth, postController.likePost);

// Route to comment on a post by ID
router.post('/comment', isAuth, postController.commentPost);

module.exports = router;