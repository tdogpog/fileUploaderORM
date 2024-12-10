//this is going to grab a root file in the database that contains EVERYTHING else, and render
//all of its contents
function getLibrary(req, res) {
  res.render("library", { title: "Library" });
}

//renders the contents of the folder when you click on it
function getFolder(req, res) {}

//creates a new folder in whatever directory you're in
//this will use the url as the url will update as you're navigating
function createFolder(req, res) {}

//uploads a file the same way create folder does, using the url to direct it
function uploadFile(req, res) {}

//deletes a file using the url
function deleteFile(req, res) {}

//deletes an entire folder recursively using the url
function deleteMethod(req, res) {}

//renames using the url
function renameMethod(req, res) {}

module.exports = {
  getLibrary,
};
