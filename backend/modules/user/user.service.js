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

const searchUserByUsername = async (username) => {
    try {
        const user = await prisma.user.findUnique({ where: { username } });
        return user;
    } catch (e) {
        console.error("Error searching user by username:", e);
    }   
}

const followUser = async (followerUsername, followingUsername) => {
    try {
        const follower = await prisma.user.findUnique({ where: { username: followerUsername } });
        if (!follower) {
            throw new Error("Follower user not found");
        }
        const following = await prisma.user.findUnique({ where: { username: followingUsername } });
        if (!following) {
            throw new Error("Following user not found");
        }
        const followerId = follower.id;
        const followingId = following.id;
        const follow = await prisma.follow.create({ 
            data: {
                followerId,
                followingId
            }
        });
        return follow;
    } catch (e) {
        console.error("Error following user:", e);
    }       
}

const unfollowUser = async (followerUsername, followingUsername) => {
    try {
        const follower = await prisma.user.findUnique({ where: { username: followerUsername } });
        if (!follower) {
            throw new Error("Follower user not found");
        }
        const following = await prisma.user.findUnique({ where: { username: followingUsername } });
        if (!following) {
            throw new Error("Following user not found");
        }
        const followerId = follower.id;
        const followingId = following.id;
        const unfollow = await prisma.follow.deleteMany({
            where: {
                followerId,
                followingId
            }
        });
        return unfollow;
    } catch (e) {
        console.error("Error unfollowing user:", e);
    }  
}

const getAllFollowers = async (username) => {
    try {
        const user = await prisma.user.findUnique({ where: { username } });
        if (!user) {
            throw new Error("User not found");
        }
        const userId = user.id;
        const followers = await prisma.follow.findMany({
            where: { followingId: userId },
            include: { follower: true }
        });
        return followers.map(f => f.follower);
    } catch (e) {
        console.error("Error getting followers:", e);
    }
}

const getAllFollowing = async (username) => {
    try {
        const user = await prisma.user.findUnique({ where: { username } });
        if (!user) {
            throw new Error("User not found");
        }
        const userId = user.id;
        const following = await prisma.follow.findMany({
            where: { followerId: userId },
            include: { following: true }
        });
        return following.map(f => f.following);
    } catch (e) {
        console.error("Error getting following:", e);
    }
}

const getProfile = async (username) => {
  try {
    const user = await prisma.user.findUnique({
      where: { username },
      select: { id: true, username: true, email: true }
    });
    return user;
  } catch (e) {
    console.error("Error getting user profile:", e);
  }
}

module.exports = {
    createUser,
    searchUserByUsername,
    followUser,
    unfollowUser,
    getAllFollowers,
    getAllFollowing,
    getProfile
}