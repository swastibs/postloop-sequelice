exports.getHomePage = (req, res) => {
  res.render("pages/home", {
    pageTitle: "Welcome to PostLoop",
  });
};
