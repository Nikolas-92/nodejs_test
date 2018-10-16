const express     = require("express");
const bodyParser  = require('body-parser')
const path        = require("path");
const mongoose    = require("mongoose");
const session     = require("express-session");
const flash       = require("connect-flash");
const passport    = require("passport");
const config      = require("./config/database");

var app = express();


// DB start
mongoose.connect(config.database, { useMongoClient: true });
var db = mongoose.connection;
db.once("open", () => {
  console.log("Connected to mongoDB");
});
db.on("error", (err) => {
  console.log(err);
});
var Article = require("./models/article");
// DB end


// View Engine
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));


// MIDDLEWARE start
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));
app.use(session({
  secret: "fasdf3242sdf234sdfdii23",
  resave: true,
  saveUninitialized: true
}));
app.use(flash());
app.use((req, res, next) => {
  res.locals.messages = require("express-messages")(req, res);
  next();
});

// Passport
require("./config/passport")(passport);
app.use(passport.initialize());
app.use(passport.session());
// MIDDLEWARE end


// ROUTE start
app.get("*", (req, res, next) => {
  res.locals.user = req.user || null;
  next();
});
app.get("/", (req, res) => {
  Article.find({}, (err, doc) => {
    if(err) { console.log(err); return; }
    res.render("index", {title: "Knowledge Base", articles: doc});
  });
});
app.use("/article", require("./routes/article"));
app.use("/user", require("./routes/user"));
// ROUTE end


app.listen(3000, () => {
  console.log("Server running at port 3000...");
});