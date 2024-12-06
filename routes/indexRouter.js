const { Router } = require("express");

const {
  homepage,
  userLogout,
  userLogin,
  userSignUp,
  getSignUp,
  signupValidation,
} = require("../controllers/indexController");

const indexRouter = Router();

//gets
indexRouter.get("/", homepage);
indexRouter.get("/sign-up-form", getSignUp);
indexRouter.get("/log-out", userLogout);

//posts
indexRouter.post("/sign-up-form", signupValidation, userSignUp);
indexRouter.post("/log-in", userLogin);

module.exports = indexRouter;
