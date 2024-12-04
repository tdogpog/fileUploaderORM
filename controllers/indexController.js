const passport = require("passsport");
const bcrypt = require("bcryptjs");
const { body, validationResult } = require("express-validator");

//PARSE EVERYTHING FOR POOL AND SQL AND REPLACE IT WITH PRISMA

//VALIDATION LAYER-----------------------------------------------

const signupValidation = [
  body("firstname").isLength({ min: 1 }).withMessage("First name is required"),
  body("lastname").isLength({ min: 1 }).withMessage("Last name is required"),
  body("username")
    .isLength({ min: 5 })
    .withMessage("Username must be at least 5 chars long")
    .custom(async (username) => {
      //no duplicate usernames
      const { rows } = await pool.query(
        "SELECT * FROM users WHERE username = $1",
        [username]
      );
      if (rows.length > 0) {
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

function userLogin(req, res) {
  console.log("Enter controller function");
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

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // send errors to the form for user to adjust inputs with
    // validation feedback
    return res.render("sign-up-form", {
      //send back the errors
      errors: errors.array(),
      //send back the form data so the user doesnt have to restart every field on re-render
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
      await pool.query(
        "INSERT INTO users (firstname, lastname, username, password) VALUES ($1,$2,$3,$4)",
        [
          req.body.firstname,
          req.body.lastname,
          req.body.username,
          hashedPassword,
        ]
      );
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