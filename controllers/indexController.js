const passport = require("passport");
const bcrypt = require("bcryptjs");
const { body, validationResult } = require("express-validator");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

//PARSE EVERYTHING FOR POOL AND SQL AND REPLACE IT WITH PRISMA

//VALIDATION LAYER-----------------------------------------------

const signupValidation = [
  body("username")
    .isLength({ min: 5 })
    .withMessage("Username must be at least 5 chars long")
    .custom(async (username) => {
      //no duplicate usernames
      const user = await prisma.user.findUnique({ where: { username } });
      if (user) {
        throw new Error("Username is already taken");
      }
    }),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 chars long"),
  //user must confirm password
  body("passwordConfirm").custom((passwordConfirm, { req }) => {
    if (passwordConfirm !== req.body.password) {
      throw new Error("Passwords must match");
    }
    return true;
  }),
];

//FUNCTION LAYER-------------------------------------------------

function homepage(req, res) {
  res.render("index", { title: "Homepage" });
}

function getSignUp(req, res) {
  // give the initial render arguments for errors/formData
  // or else formData will go undefined and 404 the page
  //required to keep the formData on the fields when validation fails
  res.render("sign-up-form", { errors: [], formData: {} });
}

//call next to stop a hang and let the redir happen
function userLogin(req, res, next) {
  console.log("Enter login function");
  console.log("Login attempt:", req.body.username, req.body.password);
  passport.authenticate("local", {
    //redir to library
    successRedirect: "/library",
    failureRedirect: "/",
  })(req, res, next);
}

function userLogout(req, res) {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
}

function userSignUp(req, res) {
  //VALIDATION

  //send errors to the form for user to adjust inputs with
  //validation feedback
  //send back the errors
  //send back the form data so the user doesnt have to restart every field on re-render
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.render("sign-up-form", {
      errors: errors.array(),
      formData: req.body || {},
    });
  }

  //HASHING AND DB INSERTION
  bcrypt.hash(req.body.password, 10, async (err, hashedPassword) => {
    if (err) {
      console.log("error hashing");
      return res.redirect("/");
    }

    //CONVERT THIS INTO PRISA ORM
    try {
      console.log("CREATING USER...");
      await prisma.user.create({
        data: {
          username: req.body.username,
          password: hashedPassword,
          folders: {
            create: {
              name: "Library",
            },
          },
        },
      });
      res.redirect("/");
    } catch (dbErr) {
      console.log("error inserting into db:", dbErr);
      return res.redirect("/");
    }
  });
}

module.exports = {
  homepage,
  getSignUp,
  userLogout,
  userSignUp,
  userLogin,
  signupValidation,
};
