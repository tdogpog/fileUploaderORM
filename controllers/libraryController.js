function getLibrary(req, res) {
  res.render("library", { title: "Library" });
}

module.exports = {
  getLibrary,
};
