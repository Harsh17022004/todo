const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const taskRouter = require("./routes/task.js");
const userSchema = require("./models/user.js");
const methodOverride = require("method-override");
const cookieParser = require("cookie-parser");
const flash = require("connect-flash");
const session = require("express-session");
const engine = require("ejs-mate");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const userRouter = require("./routes/user.js");
const ExpressError = require("./utils/ExpressError.js");
const { inLoggedIn } = require("./middlewares/isLoggedIn.js");

main().catch((err) => console.log(err));

async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/todo");
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));

app.use(methodOverride("_method"));
app.use(cookieParser("secret"));
app.use(flash());

app.engine("ejs", engine);

// express sesssion
app.use(
  session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: true,
    cookie: {
      expires: Date.now() * 7 * 24 * 60 * 60 * 1000,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(userSchema.authenticate()));

passport.serializeUser(userSchema.serializeUser());
passport.deserializeUser(userSchema.deserializeUser());

// save locals
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;
  next();
});

app.get("/", (req, res) => {
  res.redirect("/task");
});

app.use("/task", inLoggedIn, taskRouter);
app.use("/", userRouter);

app.use("*", (req, res) => {
  res.render("notFound.ejs");
  throw new ExpressError(404, "Page not found");
});

app.use((err, req, res, next) => {
  let { status = 500, message = "Internal Server Error" } = err;
  // console.log(err);
  res.status(status).render("error.ejs", { err });
});

app.listen("3000", () => {
  console.log("App is listening");
});
