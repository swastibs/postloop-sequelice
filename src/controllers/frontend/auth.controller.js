exports.getSignupPage = (req, res) => {
  res.render("pages/auth/signup", {
    pageTitle: "Sign Up",
  });
};

exports.getLoginPage = (req, res) => {
  res.render("pages/auth/login", {
    pageTitle: "Login",
  });
};
