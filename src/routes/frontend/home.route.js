const express = require("express");
const router = express.Router();
const { getHomePage } = require("../../controllers/frontend/home.controller");
const { isGuest } = require("../../middlewares/auth.middleware");

router.get("/", isGuest, getHomePage);

module.exports = router;
