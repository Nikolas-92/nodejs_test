const express   = require("express");
const bcryptjs  = require("bcryptjs");
const passport  = require("passport");
const router    = express.Router();
const { check, oneOf, validationResult } = require('express-validator/check');

var User = require("../models/user");


// GET start
router.get("/register", (req, res) => {
  res.render("register", {title: "Knowledge Base"});
});

router.get("/login", (req, res) => {
  res.render("login", {title: "Knowledge Base"});
});

router.get("/logout", (req, res) => {
  req.logout();
  req.flash("success", "Logged out");
  res.redirect("/user/login");
});
// GET end


// POST start
router.post("/register", 
  [
    check("name", "Name required").not().isEmpty(),
    check("email", "Email required").not().isEmpty(),
    check("email", "Email is not valid").isEmail(),
    check("username", "Username required").not().isEmpty(),
    check("password", "Password required").not().isEmpty(),
    check("confirm_password", "Password do not match").custom((v, {req}) => {return v === req.body.password;})
  ], (req, res) => {
  const error = validationResult(req);

  if(!error.isEmpty()) {
    res.render("register", {error: error.mapped(), title: "Knowledge Base"});
  } else {
    var user = new User({
      name: req.body.name,
      email: req.body.email,
      username: req.body.username,
      password: req.body.password
    });
    bcryptjs.genSalt(10, (err, salt) => {
      if(err) { console.log(err); return; }
      bcryptjs.hash(user.password, salt, (err, hash) => {
        if(err) { console.log(err); return; }
        user.password = hash;
        user.save((err) => {
          if(err) { console.log(err); return; }
          req.flash("success", "Registration complited");
          res.redirect("/user/login");
        });
      });
    });
  }
});

router.post("/login", (req, res, next) => {
  passport.authenticate("local", { successRedirect: "/", failureRedirect: "/user/login", failureFlash: true })(req, res, next);
});
// POST end


module.exports = router;