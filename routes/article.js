const express   = require("express");
const router    = express.Router();
const { check, oneOf, validationResult } = require('express-validator/check');

// Model
var Article = require("../models/article");
var User = require("../models/user");

// Access controll
function ensureAuthenticated(req, res, next)
{
  if(req.isAuthenticated()) { return next(); }
  req.flash("danger", "Please login");
  res.redirect("/user/login");
}


// GET start
router.get("/add", ensureAuthenticated, (req, res) => {
  res.render("addArticle", {title: "Knowledge Base"});
});

router.get("/edit/:id", ensureAuthenticated, (req, res) => {
  Article.findById(req.params.id, (err, art) => {
    if(err) { console.log(err); return; }
    if(art.author != req.user._id) { req.flash("danger", "Not Authorized"); res.redirect("/"); }
    res.render("editArticle", {article: art, title: "Knowledge Base"});
  });
});

router.get("/:id", (req, res) => {
  Article.findById(req.params.id, (err, art) => {
    if(err) { console.log(err); return; }
    User.findById(art.author, (err, u) => {
      if(err) { console.log(err); return; }
      res.render("article", {article: art, author: u.name, title: "Knowledge Base"});
    });
  });
});
// GET end


// POST start
router.post("/add", 
  [
    check("title", "Title required").not().isEmpty(),
    check("body", "Body required").not().isEmpty()
  ], (req, res) => {
  const error = validationResult(req);
  var art = new Article();

  if(!error.isEmpty()) {
    res.render("addArticle", {error: error.mapped(), title: "Knowledge Base"});
  } else {
    art.title = req.body.title;
    art.author = req.user._id;
    art.body = req.body.body;
    art.save((err) => {
      if(err) { console.log(err); return; }
      req.flash("success", "Article added");
      res.redirect("/");
    });
  }
});

router.post("/edit/:id", (req, res) => {
  var query = {_id: req.params.id};
  var art = {};
  art.title = req.body.title;
  art.author = req.body.author;
  art.body = req.body.body;

  Article.update(query, art, (err) => {
    if(err) { console.log(err); return; }
    req.flash("success", "Article updated");
    res.redirect("/");
  });
});
// POST end


// DELETE start
router.delete("/delete/:id", (req, res) => {
  if(!req.user._id) { res.status(500).send(); return; }

  var query = {_id: req.params.id};

  Article.findById(req.params.id, (err, art) => {
    if(err) { console.log(err); return; }
    if(art.author != req.user._id) { res.status(500).send(); return; }
    Article.remove(query, (err) => {
      if(err) { console.log(err); return; }
      res.send("Success");
    });
  });
});
// DELETE end


module.exports = router;