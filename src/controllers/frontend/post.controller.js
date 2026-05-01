const { Post, Comment, User, PostLike } = require("../../models");

exports.likePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.session.user.id;

    const existingLike = await PostLike.findOne({
      where: { postId, userId },
    });

    let isLiked = false;

    if (existingLike) {
      await existingLike.destroy();

      await Post.decrement("likeCount", {
        by: 1,
        where: { id: postId },
      });

      isLiked = false;
    } else {
      await PostLike.create({
        postId,
        userId,
      });

      await Post.increment("likeCount", {
        by: 1,
        where: { id: postId },
      });

      isLiked = true;
    }

    const updatedPost = await Post.findByPk(postId);

    return res.json({
      success: true,
      likeCount: updatedPost.likeCount,
      isLiked,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

exports.getSinglePostPage = async (req, res) => {
  try {
    const { postId } = req.params;
    const currentUserId = req.session.user.id;

    const post = await Post.findByPk(postId, {
      include: [
        {
          model: User,
          attributes: ["id", "name", "bio", "profilePictureUrl"],
        },
      ],
    });

    if (!post) {
      return res.redirect("/feed");
    }

    const comments = await Comment.findAll({
      where: {
        postId,
        isDeleted: false,
      },
      include: [
        {
          model: User,
          attributes: ["id", "name", "profilePictureUrl"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    const likedPost = await PostLike.findOne({
      where: {
        postId,
        userId: currentUserId,
      },
    });

    post.dataValues.isLiked = !!likedPost;

    return res.render("pages/post-details", {
      pageTitle: "Post Details",
      post,
      comments,
    });
  } catch (error) {
    console.log(error);
    return res.redirect("/feed");
  }
};

exports.addComment = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.session.user.id;
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.redirect(`/post/${postId}`);
    }

    await Comment.create({
      content: content.trim(),
      postId,
      userId,
    });

    await Post.increment("commentCount", {
      by: 1,
      where: { id: postId },
    });

    return res.redirect(`/post/${postId}`);
  } catch (error) {
    console.log(error);
    return res.redirect("/feed");
  }
};
