const { Router } = require("express");

const { getLibrary } = require("../controllers/libraryController");

const libraryRouter = Router();

//define the route at the root of the base path defined in app.js
// this will set to /library
libraryRouter.get("/", getLibrary);

module.exports = libraryRouter;
