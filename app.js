require("dotenv").config();

//base requires
const express = require("express");
const path = require("node:path");

//routers

//session and prisma
const session = require("express-session");
const { PrismaSessionStore } = require("@quixo3/prisma-session-store");
const { PrismaClient } = require("@prisma/client");

//passport auth
const passport = require("passport");
const passportConfig = require("./auth/passportConfig");

///begin app declarations///
const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
//comment back in if you want to provide style sheets for the views once backend is complete
//app.use(express.static(path.join(__dirname, "public")));

app.use(
  session({
    cookie: {
      maxAge: 1 * 24 * 60 * 60 * 1000, // ms
    },
    secret: "testSecret",
    resave: true,
    saveUninitialized: true,
    store: new PrismaSessionStore(new PrismaClient(), {
      checkPeriod: 2 * 60 * 1000, //ms
      dbRecordIdIsSessionId: true,
      dbRecordIdFunction: undefined,
    }),
  })
);

app.use(passport.session());
passportConfig(passport);

app.use("/", indexRouter);

app.use("/library", libraryRouter);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`File Uploader - listening on port ${PORT}!`);
});
