const ApiError = require("./ApiError");
const { User, Post, Comment } = require("../models");

exports.getUser = async (userId) => {
  const user = await User.findOne({
    where: { id: userId, isDeleted: false },
  });

  if (!user) throw new ApiError(404, "User not found");

  return user;
};

exports.getPost = async (postId) => {
  const post = await Post.findOne({
    where: { id: postId, isDeleted: false },
  });

  if (!post) throw new ApiError(404, "Post not found");

  return post;
};

exports.getComment = async (commentId) => {
  const comment = await Comment.findOne({
    where: { id: commentId, isDeleted: false },
  });

  if (!comment) throw new ApiError(404, "Comment not found");

  return comment;
};
