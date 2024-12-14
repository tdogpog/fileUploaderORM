const LocalStrategy = require("passport-local");
const bcrypt = require("bcryptjs");

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

//THIS NEEDS TO CHANGE TO ORM NOT EXPLCIT SQL
const passportConfig = async (passport) => {
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      console.log("Authenticating:", username, password);
      try {
        const user = await prisma.user.findUnique({ where: { username } });
        console.log("user", user);

        if (!user) {
          return done(null, false, { message: "Incorrect username" });
        }

        //hashing and salting
        const match = await bcrypt.compare(password, user.password);
        console.log("hash", match);

        if (!match) {
          // passwords do not match!
          return done(null, false, { message: "Incorrect password" });
        }

        return done(null, user);
      } catch (err) {
        return done(err);
      }
    })
  );

  passport.serializeUser((user, done) => {
    console.log("Serialized user:", user);
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await prisma.user.findUnique({
        where: { id },
      });
      console.log("Deserialized user:", user);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });
};

module.exports = { passportConfig };
