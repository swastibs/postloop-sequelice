const { isLoggedIn } = require("../../middlewares/auth.middleware");

router.get("/feed", isLoggedIn, (req, res) => {
  res.render("pages/feed");
});
