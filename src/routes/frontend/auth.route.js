const express = require("express");
const router = express.Router();
const { validate } = require("express-validation");

const {
  getSignupPage,
  getLoginPage,
} = require("../../controllers/frontend/auth.controller");

const { signUp, logIn } = require("../../controllers/auth.controller");
const upload = require("../../middlewares/multer");
const {
  signUpSchema,
  logInSchema,
} = require("../../validations/auth.validation");
const { invalidateCache } = require("../../middlewares/invalidate.middleware");
const {
  logOutFrontend,
  isGuest,
} = require("../../middlewares/auth.middleware");

// GET routes
router.get("/signup", isGuest, getSignupPage);
router.get("/login", isGuest, getLoginPage);
router.get("/logout", logOutFrontend);

router.post(
  "/signup",
  upload.single("profilePicture"),
  validate(signUpSchema),
  invalidateCache(["cache:/api/users*", "cache:/api/activities*"]),
  signUp,
);

router.post("/login", validate(logInSchema), logIn);

module.exports = router;
