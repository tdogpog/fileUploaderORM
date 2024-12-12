const db = require("../db/libraryQueries");

const fs = require("fs");

//this is going to grab a root file in the database that contains EVERYTHING else, and render
//all of its contents
async function getLibrary(req, res) {
  const rootFolder = await db.getLibraryDatabase(req.user.id);
  //redir intead of render to take the user to their file dir based off id when auth checks out
  res.redirect(`/library/${rootFolder.id}`);
}

//renders the contents of the folder when you click on it
//this will get the root folder at first and forEach on the view to display all contents of the library
async function renderFolder(req, res) {
  //get the folder with cross table matching
  const folderResponse = await db.getFolderDatabase(
    req.user.id,
    req.params.folderID
  );
  res.render("library", { folder: folderResponse });
}

async function renderFile(req, res) {
  const fileID = req.params.fileID;
  const file = await db.getFileDatabase(fileID);

  res.render("file", { file: file });
}

//creates a new folder in whatever directory you're in
//this will use the url as the url will update as you're navigating
async function createFolder(req, res) {
  const userID = req.user.id;
  const parentFolderID = req.params.folderID;
  await db.createFolderDatabse(userID, parentFolderID);
  //refresh the page to where the folder was created in
  //to display change to user
  res.redirect(`/library/${parentFolderID}`);
}

//uploads a file the same way create folder does, using the url to direct it
async function uploadFile(req, res) {
  if (!req.file) {
    //redir if you dont get a file to stop a 404
    const redirectUrl = req.get("Referer") || `/`;
    res.redirect(redirectUrl);
  }
  try {
    console.log("file upload:", req.file);
    const userID = req.user.id;
    const currentFolderID = req.params.folderID;
    const { originalname, size, path } = req.file;

    //add file to db
    await db.addFileDatabase(originalname, path, size, currentFolderID);

    //delete the file from the temp multer storage uploads/
    //once its gotten to the postgresql db
    fs.unlink(path, (err) => {
      if (err) {
        console.error("Error deleting temporary file:", err);
      }
    });

    const redirectUrl = req.get("Referer") || `/`;
    res.redirect(redirectUrl);
  } catch (error) {
    console.log("upload error", error.message);
    res.status(500).send("Error uploading file");
  }
}

//deletes an entire folder recursively using the url
async function deleteMethod(req, res) {
  const type = req.params.type;
  const id = req.params.id;

  await db.deleteMethodDatabase(type, id);

  //redirect to update, fallback to root if failure
  const redirectUrl = req.get("Referer") || `/`;
  res.redirect(redirectUrl);
}

//renames using the url
async function renameMethod(req, res) {
  const type = req.params.type;
  const id = req.params.id;

  const { name } = req.body;

  await db.renameMethodDatabase(type, id, name);

  //redirect to update, fallback to root if failure
  const redirectUrl = req.get("Referer") || `/`;
  res.redirect(redirectUrl);
}

module.exports = {
  getLibrary,
  renderFolder,
  renderFile,
  createFolder,
  uploadFile,
  deleteMethod,
  renameMethod,
};
