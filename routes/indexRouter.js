const { Router } = require("express");

const {
  homepage,
  userLogout,
  userLogin,
  userSignUp,
  getSignUp,
  signupValidation,
} = require("../controllers/authController");

const indexRouter = Router();

//gets
indexRouter.get("/", homepage);
indexRouter.get("/sign-up", getSignUp);
indexRouter.get("/log-out", userLogout);

//posts
indexRouter.post("/sign-up", signupValidation, userSignUp);
indexRouter.post("/log-in", userLogin);

module.exports = indexRouter;
