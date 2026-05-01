const express = require("express");
const router = express.Router();
const { getHomePage } = require("../../controllers/frontend/home.controller");

router.get("/", getHomePage);

module.exports = router;
