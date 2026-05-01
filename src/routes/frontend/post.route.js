const express = require("express");
const router = express.Router();

const {
  likePost,
  getSinglePostPage,
  addComment,
} = require("../../controllers/frontend/post.controller");
const { isLoggedIn } = require("../../middlewares/auth.middleware");

router.post("/like/:postId", isLoggedIn, likePost);

router.get("/:postId", isLoggedIn, getSinglePostPage);

router.post("/:postId/comment", isLoggedIn, addComment);

module.exports = router;
