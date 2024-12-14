const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

//fetch the root
// this func just wants to grab the id
// to redir to the render router
async function getLibraryDatabase(userID) {
  try {
    const library = await prisma.folder.findFirst({
      where: {
        userID: userID,
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
    const folders = await prisma.folder.findFirst({
      where: {
        userID: userID,
        id: folderID,
      },
      include: {
        parent: true,
        subfolders: {
          orderBy: {
            updatedAt: "desc",
          },
        },
        files: {
          orderBy: {
            updatedAt: "desc",
          },
        },
      },
    });
    return folders;
  } catch (error) {
    console.log("error fetching folder view in db:", error.message);
  }
}

//fetch the file view
async function getFileDatabase(fileID) {
  try {
    const file = await prisma.file.findFirst({
      where: {
        id: fileID,
      },
      //include so we can go back to parent folder?
      include: {
        folder: true,
      },
    });
  } catch (error) {
    console.log("error fetching file view in db:", error.message);
  }
}

//create a new folder
async function createFolderDatabase(userID, parentFolderID) {
  try {
    const newFolder = await prisma.folder.create({
      data: {
        name: "New Folder",
        userID: userID,
        parentID: parentFolderID,
      },
    });
    // the controller isnt using this but keeping it in for future use
    return newFolder;
  } catch (error) {
    console.log("error creating folder in db:", error.message);
  }
}

//uploading a new file
async function addFileDatabase(originalname, path, size, folderID) {
  try {
    const newFile = await prisma.file.create({
      data: {
        name: originalname,
        path: path,
        size: size,
        folderID: folderID,
      },
    });
    return newFile;
  } catch (error) {
    console.log("error creating file in db:", error.message);
  }
}

//deletion
async function deleteMethodDatabase(type, id) {
  console.log("entering deletion db", type, id);
  try {
    const query = {
      where: {
        id: id,
      },
    };
    if (type === "folder") {
      await deleteFolderRecursion(query);
    } else if (type === "file") {
      await prisma.file.delete(query);
    }
  } catch (error) {
    console.log("error deleting file or folder in db:", error.message);
  }
}

//renaming
async function renameMethodDatabase(type, id, updatedName) {
  try {
    const query = {
      where: {
        id: id,
      },
      data: {
        name: updatedName,
      },
    };
    if (type === "folder") {
      await prisma.folder.update(query);
    } else if (type === "file") {
      await prisma.file.update(query);
    }
  } catch (error) {
    console.log("error updating file or folder in db:", error.message);
  }
}

//helper functions

async function deleteFolderRecursion(folderID) {
  try {
    //fetch all subfolders of the current folder
    const subfolders = await prisma.folder.findMany({
      where: { parentID: folderID },
    });

    //recursively delete each subfolder
    for (const subfolder of subfolders) {
      await deleteFolderRecursion(subfolder.id);
    }

    //delete all files within the current folder
    await prisma.file.deleteMany({
      where: { folderID: folderID },
    });

    //delete the current folder
    await prisma.folder.delete({
      where: { id: folderID },
    });
  } catch (error) {
    console.log("error in cascading folder deletion:", error.message);
  }
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
