const express = require("express");
const router = express.Router();
const userSchema = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync.js");
const passport = require("passport");

router
  .route("/signup")
  .get((req, res) => {
    res.render("signup.ejs");
  })
  .post(async (req, res, next) => {
    try {
      const { username, email, password } = req.body.User;
      const newUser = new userSchema({ username, email });
      const registerUser = await userSchema.register(newUser, password);
      req.login(registerUser, (err) => {
        if (err) {
          return next(err);
        }
        req.flash("success", "Welcome!!!");
        res.redirect("/task");
      });
    } catch (err) {
      req.flash("error", err.message);
      res.redirect("/signup");
    }
  });

router
  .route("/login")
  .get((req, res) => {
    res.render("login.ejs");
  })
  .post(
    passport.authenticate("local", {
      failureRedirect: "/login",
      failureFlash: true,
    }),
    async (req, res) => {
      req.flash("success", "Welcome Back !!");
      res.redirect("/task");
    }
  );

router.post("/logout", async (req, res) => {
  req.logOut((err) => {
    if (err) {
      return next(err);
    }
    req.flash("success", "Logout Successfully");
    res.redirect("/task");
  });
});

module.exports = router;
