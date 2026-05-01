const express = require("express");
const router = express.Router();

// Backend API Routers
const authRouter = require("./auth.route");
const userRouter = require("./user.route");
const postRouter = require("./post.route");
const commentRouter = require("./comment.route");
const activityRouter = require("./activity.route");

// Frontend API Routers
const frontendHomeRouter = require("./frontend/home.route");
const frontendAuthRoutes = require("./frontend/auth.route");

// Mount backend APIs
router.use("/api/auth", authRouter);
router.use("/api/users", userRouter);
router.use("/api/posts", postRouter);
router.use("/api/comments", commentRouter);
router.use("/api/activities", activityRouter);

// Mount frontend APIs
router.use("/", frontendHomeRouter);
router.use("/", frontendAuthRoutes);

module.exports = router;
