const { Op } = require("sequelize");
const { Post, User, UserFollow } = require("../../models");

exports.getHomePage = (req, res) => {
  res.render("pages/home", {
    pageTitle: "Welcome to PostLoop",
  });
};

exports.getFeedPage = async (req, res) => {
  try {
    const currentUserId = req.session.user.id;
    const limit = 9;

    const userInclude = {
      model: User,
      attributes: ["id", "name", "profilePictureUrl", "bio"],
    };

    // following users
    const following = await UserFollow.findAll({
      where: { followerId: currentUserId },
      attributes: ["followingId"],
      raw: true,
    });

    const followingIds = following.map((f) => f.followingId);

    // suggested users
    const suggestedUsers = await User.findAll({
      where: {
        id: {
          [Op.notIn]: [...followingIds, currentUserId],
        },
        isDeleted: false,
        isActive: true,
        role: {
          [Op.ne]: "admin",
        },
      },
      attributes: [
        "id",
        "name",
        "profilePictureUrl",
        "bio",
        "postsCount",
        "followersCount",
        "followingCount",
      ],
      limit: 6,
      order: User.sequelize.random(),
    });

    let posts = [];

    if (followingIds.length > 0) {
      // 70% following posts
      const followingPosts = await Post.findAll({
        where: {
          isDeleted: false,
          userId: {
            [Op.in]: followingIds,
          },
        },
        include: [userInclude],
        order: [["createdAt", "DESC"]],
        limit: 7,
      });

      // 30% random posts
      const randomPosts = await Post.findAll({
        where: {
          isDeleted: false,
          userId: {
            [Op.notIn]: [...followingIds, currentUserId],
          },
        },
        include: [userInclude],
        order: Post.sequelize.random(),
        limit: 3,
      });

      posts = [...followingPosts, ...randomPosts];
    } else {
      posts = await Post.findAll({
        where: {
          isDeleted: false,
          userId: {
            [Op.ne]: currentUserId,
          },
        },
        include: [userInclude],
        order: Post.sequelize.random(),
        limit,
      });
    }

    // shuffle for fresh feed every refresh
    posts = posts.sort(() => Math.random() - 0.5);

    return res.render("pages/feed", {
      pageTitle: "Feed",
      posts,
      suggestedUsers,
    });
  } catch (error) {
    console.log(error);

    req.flash("error_msg", "Failed to load feed");

    return req.session.save(() => {
      res.redirect("/");
    });
  }
};
