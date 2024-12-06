const { Router } = require("express");

const { getLibrary } = require("../controllers/libraryController");

const libraryRouter = Router();

//gets
libraryRouter.get("/library", getLibrary);

module.exports = libraryRouter;
