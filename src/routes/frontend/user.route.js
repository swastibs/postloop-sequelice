const express = require("express");
const router = express.Router();

const { isLoggedIn } = require("../../middlewares/auth.middleware");
const {
  followUserFrontend,
} = require("../../controllers/frontend/user.controller");

router.post("/follow/:userId", isLoggedIn, followUserFrontend);

module.exports = router;
