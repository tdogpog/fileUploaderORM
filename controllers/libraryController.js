const fs = require("fs");
const path = require("path");

const {
  getLibraryDatabase,
  getFolderDatabase,
  getFileDatabase,
  createFolderDatabase,
  getDownloadDatabase,
  addFileDatabase,
  deleteMethodDatabase,
  renameMethodDatabase,
} = require("../db/libraryQueries");

//this is going to grab a root file in the database that contains EVERYTHING else
//redir sends it to the /library/:fileID route
//which is defined in the router to send us to renderFolder
//this will execute the getFolderDB function upon the root folder
//we went and and fetched in this function
async function getLibrary(req, res) {
  console.log("entering getLibrary controller...");
  const rootFolder = await getLibraryDatabase(req.user.id);

  res.redirect(`/library/${rootFolder.id}`);
}

//renders the contents of the folder when you click on it
//this will get the root folder at first and forEach on the view to display all contents of the library
async function renderFolder(req, res) {
  console.log("entering renderFolder controller...");
  //get the folder with cross table matching
  const folderResponse = await getFolderDatabase(
    req.user.id,
    req.params.folderID
  );
  res.render("library", { folder: folderResponse });
}

async function renderFile(req, res) {
  const fileID = req.params.fileID;
  const file = await getFileDatabase(fileID);

  res.render("file", { file: file });
}

//creates a new folder in whatever directory you're in
//this will use the url as the url will update as you're navigating
async function createFolder(req, res) {
  const userID = req.user.id;
  console.log("folder id in creating", req.params.folderID);
  const parentFolderID = req.params.folderID;
  await createFolderDatabase(userID, parentFolderID);
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
    await addFileDatabase(originalname, path, size, currentFolderID);

    //delete the file from the temp multer storage uploads/
    //once its gotten to the postgresql db
    // fs.unlink(path, (err) => {
    //   if (err) {
    //     console.error("Error deleting temporary file:", err);
    //   }
    // });

    const redirectUrl = req.get("Referer") || `/`;
    res.redirect(redirectUrl);
  } catch (error) {
    console.log("upload error", error.message);
    res.status(500).send("Error uploading file");
  }
}

async function downloadFile(req, res) {
  try {
    const fileToDownload = req.params.fileID;
    const file = await getDownloadDatabase(fileToDownload);
    //these two are grabbed from the db
    const filePath = path.resolve(__dirname, "../", file.path); // Path to the file on the server
    console.log("File path from database:", file.path);

    const fileName = file.name; // Original file name for download

    res.download(filePath, fileName, (err) => {
      if (err) {
        console.error("Error during file download:", err.message);
        res.status(500).send("Error downloading file.");
      }
    });
  } catch (error) {
    console.log("download error msg", error.message);
    res.status(500).send("error dling file");
  }
}

//deletes an entire folder recursively using the url
async function deleteMethod(req, res) {
  const type = req.params.type;
  const id = req.params.id;

  console.log("entering controller for deletion", type, id);

  await deleteMethodDatabase(type, id);

  //redirect to update, fallback to root if failure
  const redirectUrl = req.get("Referer") || `/`;
  res.redirect(redirectUrl);
}

//renames using the url
async function renameMethod(req, res) {
  try {
    const type = req.params.type;
    const id = req.params.id;

    console.log("req.body:", req.body); // Log the parsed body
    console.log("req.params:", req.params);

    const { name } = req.body;

    console.log("Name received:", name);

    await renameMethodDatabase(type, id, name);

    //redirect to update, fallback to root if failure
    const redirectUrl = req.get("Referer") || `/`;
    res.redirect(redirectUrl);
  } catch (error) {
    console.log("rename method error:", error.message);
    res.status(500).send("Error renaming");
  }
}

module.exports = {
  getLibrary,
  renderFolder,
  renderFile,
  createFolder,
  uploadFile,
  downloadFile,
  deleteMethod,
  renameMethod,
};
