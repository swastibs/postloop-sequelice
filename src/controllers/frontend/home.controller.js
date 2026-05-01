const { Op } = require("sequelize");
const { Post, User, UserFollow, PostLike } = require("../../models");

exports.getHomePage = (req, res) => {
  res.render("pages/home", {
    pageTitle: "Welcome to PostLoop",
  });
};

exports.getFeedPage = async (req, res) => {
  try {
    const currentUserId = req.session.user?.id;

    if (!currentUserId) {
      req.flash("error_msg", "Please login first");
      return req.session.save(() => res.redirect("/login"));
    }

    const limit = 9;

    const userInclude = {
      model: User,
      attributes: ["id", "name", "profilePictureUrl", "bio"],
    };

    // ---------------- FOLLOWING IDS ----------------
    const followingRows = await UserFollow.findAll({
      where: { followerId: currentUserId },
      attributes: ["followingId"],
      raw: true,
    });

    const followingIds = followingRows.map((f) => f.followingId);

    const excludeIds = [...followingIds, currentUserId];

    // ---------------- SUGGESTED USERS ----------------
    const suggestedUsers = await User.findAll({
      where: {
        id: { [Op.notIn]: excludeIds.length ? excludeIds : [0] },
        isDeleted: false,
        isActive: true,
        role: { [Op.ne]: "admin" },
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

    // attach follow state (fast in-memory)
    const followingSet = new Set(followingIds);

    const enrichedSuggestedUsers = suggestedUsers.map((user) => {
      const u = user.toJSON();
      u.isFollowing = followingSet.has(u.id);
      return u;
    });

    // ---------------- POSTS ----------------
    const basePostWhere = {
      isDeleted: false,
    };

    let posts;

    if (followingIds.length) {
      const [followingPosts, randomPosts] = await Promise.all([
        Post.findAll({
          where: {
            ...basePostWhere,
            userId: { [Op.in]: followingIds },
          },
          include: [userInclude],
          order: [["createdAt", "DESC"]],
          limit: 7,
        }),

        Post.findAll({
          where: {
            ...basePostWhere,
            userId: { [Op.notIn]: excludeIds },
          },
          include: [userInclude],
          order: User.sequelize.random(),
          limit: 3,
        }),
      ]);

      posts = [...followingPosts, ...randomPosts];
    } else {
      posts = await Post.findAll({
        where: {
          ...basePostWhere,
          userId: { [Op.ne]: currentUserId },
        },
        include: [userInclude],
        order: User.sequelize.random(),
        limit,
      });
    }

    // ---------------- LIKE STATUS (OPTIMIZED SET) ----------------
    const postIds = posts.map((p) => p.id);

    const likedRows = await PostLike.findAll({
      where: {
        userId: currentUserId,
        postId: postIds.length ? { [Op.in]: postIds } : [0],
      },
      attributes: ["postId"],
      raw: true,
    });

    const likedSet = new Set(likedRows.map((l) => l.postId));

    const enrichedPosts = posts.map((post) => {
      const p = post.toJSON();
      p.isLiked = likedSet.has(p.id);
      return p;
    });

    // shuffle final feed (safe)
    enrichedPosts.sort(() => Math.random() - 0.5);

    console.log("enrichedPosts", enrichedPosts);
    console.log("enrichedSuggestedUsers", enrichedSuggestedUsers);

    return res.render("pages/feed", {
      pageTitle: "Feed",
      posts: enrichedPosts,
      suggestedUsers: enrichedSuggestedUsers,
    });
  } catch (error) {
    console.error(error);

    req.flash("error_msg", "Failed to load feed");

    return req.session.save(() => {
      res.redirect("/");
    });
  }
};
