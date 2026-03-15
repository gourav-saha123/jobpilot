const {createPost, getPostByUserId, updatePost, deletePost, getAllPosts, likePost, getPostByUsername, commentPost} = require('./post.service');

const createPostController = async (req, res) => {
    try {
        const {title, content} = req.body;
        const authenticatedUserId = req.user.id;
        const post = await createPost({title, content, authorId: authenticatedUserId});
        res.status(201).json(post);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create post' });
    }
};

const getPosts = async (req, res) => {
    try {
        const authenticatedUserId = req.user.id;
        const posts = await getPostByUserId(authenticatedUserId);
        res.status(200).json(posts);
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve posts' });
    }
};

const getAllPostsByUsername = async (req, res) => {
    try {
        const posts = await getPostByUsername(req.params.username);
        res.status(200).json(posts);
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve posts by username' });
    }
}

const updatePostController = async (req, res) => {
    try {
        const authenticatedUserId = req.user.id;
        if (authenticatedUserId !== req.body.authorId) {
            return res.status(403).json({ error: 'Unauthorized to update this post' });
        }
        const postToUpdate = await getPostByUserId(authenticatedUserId).then(posts => posts.find(post => post.id === Number(req.params.id)));
        if (!postToUpdate) {
            return res.status(404).json({ error: 'Post not found or unauthorized to update' });
        }
        const post = await updatePost(req.params.id, req.body);
        res.status(200).json(post);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update post' });
    }
};

const deletePostController = async (req, res) => {
    try {
        const authenticatedUserId = req.user.id;
        if(authenticatedUserId !== req.body.authorId) {
            return res.status(403).json({ error: 'Unauthorized to delete this post' });
        }
        const postToDelete = await getPostByUserId(authenticatedUserId).then(posts => posts.find(post => post.id === Number(req.params.id)));
        if (!postToDelete) {
            return res.status(404).json({ error: 'Post not found or unauthorized to delete' });
        }
        await deletePost(req.params.id);
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete post' });
    }
};

const likePostController = async (req, res) => {
    try {
        const postId = req.params.id;
        const authenticatedUserId = req.user.id;
        const post = await likePost(postId, authenticatedUserId);
        res.status(200).json(post);
    } catch (error) {
        res.status(500).json({ error: 'Failed to like post' });
    }
};

const commentPostController = async (req, res) => {
    try {
        const postId = req.params.id;
        const commentData = {
            userId: req.user.id,
            content: req.body.content,
            createdAt: new Date(),
        };
        const post = await commentPost(postId, commentData);
        res.status(200).json(post);
    } catch (error) {
        res.status(500).json({ error: 'Failed to comment on post' });
    }
};

module.exports = {
    createPost: createPostController,
    getPosts: getPosts,
    updatePost: updatePostController,
    deletePost: deletePostController,
    getAllPostsByUsername: getAllPostsByUsername,
    likePost: likePostController,
    commentPost: commentPostController,
};