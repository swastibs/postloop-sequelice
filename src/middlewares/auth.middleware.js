const passport = require("passport");

exports.authenticate = passport.authenticate("jwt", { session: false });

exports.isLoggedIn = (req, res, next) => {
  if (!req.session.user) {
    req.flash("error_msg", "Please login first");

    return req.session.save(() => {
      res.redirect("/login");
    });
  }

  next();
};

exports.logOutFrontend = (req, res) => {
  req.session.destroy(() => {
    res.redirect("/login");
  });
};

exports.isGuest = (req, res, next) => {
  if (req.session.user) {
    return res.redirect("/feed");
  }
  next();
};
