const { User, UserFollow } = require("../../models");

exports.followUserFrontend = async (req, res) => {
  try {
    const followerId = req.session.user.id;
    const followingId = req.params.userId;

    if (Number(followerId) === Number(followingId)) {
      return res.status(400).json({
        success: false,
        message: "You cannot follow yourself",
      });
    }

    const existingFollow = await UserFollow.findOne({
      where: {
        followerId,
        followingId,
      },
    });

    if (existingFollow) {
      await existingFollow.destroy();

      await User.decrement("followersCount", {
        by: 1,
        where: { id: followingId },
      });

      await User.decrement("followingCount", {
        by: 1,
        where: { id: followerId },
      });

      return res.json({
        success: true,
        isFollowing: false,
        message: "User unfollowed successfully",
      });
    }

    await UserFollow.create({
      followerId,
      followingId,
    });

    await User.increment("followersCount", {
      by: 1,
      where: { id: followingId },
    });

    await User.increment("followingCount", {
      by: 1,
      where: { id: followerId },
    });

    return res.json({
      success: true,
      isFollowing: true,
      message: "User followed successfully",
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};
