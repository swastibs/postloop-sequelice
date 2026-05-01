const express = require("express");
const router = express.Router();
const {
  getLoginPage,
  getSignupPage,
} = require("../../controllers/frontend/auth.controller");

// Frontend pages
router.get("/login", getLoginPage);
router.get("/signup", getSignupPage);

module.exports = router;
