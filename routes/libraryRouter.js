const { Router } = require("express");

const multer = require("multer");

const upload = multer({
  limits: { fileSize: 10485760 }, // Limit file size to 10MB
  dest: "uploads/", // Save files in the "uploads" folder
});

const {
  getLibrary,
  renderFolder,
  renderFile,
  uploadFile,
  downloadFile,
  createFolder,
  renameMethod,
  deleteMethod,
} = require("../controllers/libraryController");

const libraryRouter = Router();

//define the route at the root of the base path defined in app.js
// this will set to /library
libraryRouter.get("/", getLibrary);

//renders the contents of the folder
//folder id will get grabbed from the db query
libraryRouter.get("/:folderID", renderFolder);

//get for the files to be rendered
libraryRouter.get("/file/:fileID", renderFile);

//MULTER PROCESS
// Upload a file to the specified folder
libraryRouter.post(
  "/:folderID/upload",
  upload.single("uploaded_file"),
  uploadFile
);

//DOWNLOADING THE FILE
libraryRouter.get("/file/:fileID/download", downloadFile);

libraryRouter.post("/:folderID/add-sub", createFolder);

//the database needs to know if its a folder/file so track its type
//along with its ID for
//updating and deletion
// THE TYPE AND THE ID WILL BE DEFINED VIA HTML ON CREATION
// LET THE EJS WORK THIS OUT
libraryRouter.post("/:type/:id/rename", renameMethod);
libraryRouter.post("/:type/:id/delete", deleteMethod);

module.exports = libraryRouter;
