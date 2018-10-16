const LocalStrategy   = require("passport-local");
const User            = require("../models/user");
const config          = require("../config/database");
const bcryptjs        = require("bcryptjs");

module.exports = function(passport) 
{
  passport.use(new LocalStrategy((username, password, done) => {
    User.findOne({username:username}, (err, user) => {
      if(err) throw err;
      if(!user) { return done(null, false, {message: "No user found"}); }
      bcryptjs.compare(password, user.password, (err, isMatch) => {
        if(err) throw err;
        if(isMatch) { return done(null, user); }
        return done(null, false, {message: "Wrong password"});
      });
    });
  }));

  passport.serializeUser((user, done) => { done(null, user.id); });
  passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => { done(err, user); });
  });
}