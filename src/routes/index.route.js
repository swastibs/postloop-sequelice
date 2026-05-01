const express = require("express");
const router = express.Router();

// BACKEND API ROUTES
const authRouter = require("./auth.route");
const userRouter = require("./user.route");
const postRouter = require("./post.route");
const commentRouter = require("./comment.route");
const activityRouter = require("./activity.route");

// FRONTEND ROUTES
const frontendHomeRouter = require("./frontend/home.route");
const frontendAuthRoutes = require("./frontend/auth.route");
const feedRoute = require("./frontend/feed.route");
const frontendPostRoute = require("./frontend/post.route");
const frontendUserRoute = require("./frontend/user.route");

// BACKEND API MOUNT
router.use("/api/auth", authRouter);
router.use("/api/users", userRouter);
router.use("/api/posts", postRouter);
router.use("/api/comments", commentRouter);
router.use("/api/activities", activityRouter);

// FRONTEND ROUTE MOUNT
router.use("/", frontendHomeRouter);
router.use("/", frontendAuthRoutes);
router.use("/", feedRoute);

// for like, comment details page
router.use("/post", frontendPostRoute);

// for follow/unfollow
router.use("/user", frontendUserRoute);

module.exports = router;
