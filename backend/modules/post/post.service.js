const prisma = require('../../config/prisma');

const createPost = async (data) => {
  return await prisma.post.create({
    data,
  });
};

const getAllPosts = async () => {
  return await prisma.post.findMany();
}

const getPostByUserId = async (userId) => {
  return await prisma.post.findMany({
    where: { authorId: Number(userId) },
  });
}

const getPostByUsername = async (username) => {
  return await prisma.post.findMany({
    where: { author: { username } },
  });
}

const likePost = async (postId, userId) => {
  const post = await prisma.post.findUnique({
    where: { id: Number(postId) },
  });
  if (!post) {
    throw new Error('Post not found');
  }
  const updatedLikes = post.likes.includes(userId)
    ? post.likes.filter(id => id !== userId)
    : [...post.likes, userId];
  return await prisma.post.update({
    where: { id: Number(postId) },
    data: { likes: updatedLikes },
  });
}

const commentPost = async (postId, commentData) => {
  const post = await prisma.post.findUnique({
    where: { id: Number(postId) },
  });
  if (!post) {
    throw new Error('Post not found');
  }
  const updatedComments = [...post.comments, commentData];
  return await prisma.post.update({
    where: { id: Number(postId) },
    data: { comments: updatedComments },
  });
}

const updatePost = async (id, data) => {
  return await prisma.post.update({
    where: { id: Number(id) },
    data,
  });
}

const deletePost = async (id) => {
  return await prisma.post.delete({
    where: { id: Number(id) },
  });
}

module.exports = {
  createPost,
  getAllPosts,
  getPostByUserId,
  updatePost,
  deletePost,
  likePost,
  commentPost,
  getPostByUsername,
};