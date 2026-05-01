const express = require("express");
const router = express.Router();

const { isLoggedIn } = require("../../middlewares/auth.middleware");
const { getFeedPage } = require("../../controllers/frontend/home.controller");

router.get("/feed", isLoggedIn, getFeedPage);

module.exports = router;
