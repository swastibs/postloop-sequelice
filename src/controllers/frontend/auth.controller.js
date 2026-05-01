exports.getLoginPage = (req, res) => {
  res.render("pages/auth/login", {
    pageTitle: "Login",
    error_msg: req.flash("error_msg"),
    success_msg: req.flash("success_msg"),
  });
};

exports.getSignupPage = (req, res) => {
  res.render("pages/auth/signup", {
    pageTitle: "Sign Up",
    error_msg: req.flash("error_msg"),
    success_msg: req.flash("success_msg"),
  });
};
