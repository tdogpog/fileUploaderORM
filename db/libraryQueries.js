const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

//fetch the root
async function getLibraryDatabase(userID) {
  try {
    const library = await prisma.folder.findFirst({
      where: {
        userID,
        //ensures we're pulling the root created at account inception
        parentID: null,
      },
      include: {
        subfolders: true,
        files: true,
      },
    });
    return library;
  } catch (error) {
    console.log("error fetching library in db:", error.message);
  }
}
//fetch the folder view
async function getFolderDatabase(userID, folderID) {
  try {
  } catch (error) {}
}
//fetch the file view
async function getFileDatabase(fileID) {
  try {
  } catch (error) {}
}
//create a new folder
async function createFolderDatabase(userID, parentFolderID) {
  try {
  } catch (error) {}
}
//uploading a new file
async function addFileDatabase(originalname, path, size, parentFolderID) {
  try {
  } catch (error) {}
}
//deletion
async function deleteMethodDatabase(type, id) {
  try {
  } catch (error) {}
}
//renaming
async function renameMethodDatabase(type, id, name) {
  try {
  } catch (error) {}
}

module.exports = {
  getLibraryDatabase,
  getFolderDatabase,
  getFileDatabase,
  createFolderDatabase,
  addFileDatabase,
  deleteMethodDatabase,
  renameMethodDatabase,
};
