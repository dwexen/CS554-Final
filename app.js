// server.js

// set up ======================================================================
// get all the tools we need
var express  = require('express');
var app      = express();
var port     = process.env.PORT || 8080;
var mongoose = require('mongoose');
var passport = require('passport');
var flash    = require('connect-flash');

var morgan       = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser');
var session      = require('express-session');

var configDB = require('./config/database.js');

const static = express.static(__dirname + '/public');

// configuration ===============================================================
mongoose.connect('mongodb://localhost/cs554-final'); // connect to our database

require('./config/passport')(passport); // pass passport for configuration

app.use("/public", static);
// set up our express application
app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser.json()); // get information from html forms
app.use(bodyParser.urlencoded({ extended: true }));

app.set('view engine', 'ejs'); // set up ejs for templating

// required for passport
app.use(session({
    secret: 'ilovescotchscotchyscotchscotch', // session secret
    resave: true,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

// routes ======================================================================
require('./app/routes.js')(app, passport); // load our routes and pass in our app and fully configured passport

// launch ======================================================================
app.listen(port);
console.log('The magic happens on port ' + port);





















/*
const crawler = require("./crawler");
const data = require("./data");
const pages = data.pages;
const users = data.users;
var testWords = ["stemming", "technology", "new", "computer", "programming", "science", "politics", "trump"];
//crawler.startCrawl("http://www.arstechnica.com", testWords, 10);
//crawler.startCrawl("http://www.arstechnica.com", testWords, 10, .60);

// Template taken from https://github.com/passport/express-4.x-local-example and modified for my use
var express = require('express');
var passport = require('passport');
var Strategy = require('passport-local').Strategy;
var db = require('./data');
var flash = require('connect-flash');
const exphbs = require('express-handlebars');
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt-nodejs");
const hash = bcrypt.hashSync("plainTextPassword");

const handlebarsInstance = exphbs.create({
    defaultLayout: 'main',
    // Specify helpers which are only registered on this instance.
    helpers: {
        asJSON: (obj, spacing) => {
            if (typeof spacing === "number")
                return new Handlebars.SafeString(JSON.stringify(obj, null, spacing));
        
            return new Handlebars.SafeString(JSON.stringify(obj));
        }
    }
});

// Configure the local strategy for use by Passport.
//
// The local strategy require a `verify` function which receives the credentials
// (`username` and `password`) submitted by the user.  The function must verify
// that the password is correct and then invoke `cb` with a user object, which
// will be set at `req.user` in route handlers after authentication.
passport.use('local-login', new Strategy(
  function(username, password, cb) {
    db.users.getUserByName(username).then( function(err, user) {
      if (err) { return cb(err); }
      if (!user) { return cb(null, false); }
      console.log("ABOUT TO COMPARE PASSWORDS");
      bcrypt.compare(password, user.password, (err, res) => {
        if (res != true) {
          return cb(null, false);
        }
        return cb(null, user);
      });
    });
  }));


// Configure Passport authenticated session persistence.
//
// In order to restore authentication state across HTTP requests, Passport needs
// to serialize users into and deserialize users out of the session.  The
// typical implementation of this is as simple as supplying the user ID when
// serializing, and querying the user record by ID from the database when
// deserializing.
passport.serializeUser(function(user, cb) {
  console.log("error here inside serialize?");
  console.log(user._id);
  cb(null, user._id);
});

passport.deserializeUser(function(id, cb) {
  db.users.getUserById(id).then( function (err, user) {
    if (err) { return cb(err); }
    console.log("Error here?");
    cb(null, user);
  });
});


passport.use('local-signup', new Strategy({
        // by default, local strategy uses username and password, we will override with email
        usernameField : 'username',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass back the entire request to the callback
    },
    function(req, username, password, done) {

        // asynchronous
        // User.findOne wont fire unless data is sent back
        console.log("before next tick call")
        process.nextTick(function() {
        console.log("right before getUserByName Call");
        // find a user whose email is the same as the forms email
        // we are checking to see if the user trying to login already exists
        db.users.getUserByName(username).then(function(err, user) {
            // if there are any errors, return the error
            if (err)
            {
                console.log("hanging here?");
                return done(err);
            }

            // check to see if theres already a user with that email
            if (user) {
                console.log("AM I HERE?!");
                return done(null, false, req.flash('signupMessage', 'That username is already taken.'));
            } else {
                console.log("Attempting to add to DB");
                password = bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
                db.users.addUser(username, password).then((user) => {
                    console.log(user.username + " added!");
                    return done(null, user);
                });
                console.log("Here as well?");
                //return;
              
            }

        });    

        });

    }));

// Create a new Express application.
var app = express();

app.engine('handlebars', handlebarsInstance.engine);
// Configure view engine to render EJS templates.
app.set('views', __dirname + '/views');
app.set('view engine', 'handlebars');
// Use application-level middleware for common functionality, including
// logging, parsing, and session handling.
app.use(require('morgan')('combined'));
app.use(require('cookie-parser')());
app.use(require('body-parser').urlencoded({ extended: true }));
app.use(require('express-session')({ secret: 'keyboard cat', resave: false, saveUninitialized: false }));


app.use(flash());

// Initialize Passport and restore authentication state, if any, from the
// session.
app.use(passport.initialize());
app.use(passport.session());

// Define routes.
app.get('/',
  function(req, res) {
    if (req.user !== undefined) 
      res.redirect('/private');
    else
      res.render('login/login', { user: req.user, error: req.flash('error'), title: "Login" });
  });
app.get('/signup', function(req, res) {
    res.render('login/signup', {error: req.flash('error'), title: "signup"});
})
app.post('/signup', 
passport.authenticate('local-signup', {failureRedirect: '/signup', failureFlash: true}),
function(req, res) {
    //console.log("Error is: " + res.error);
    res.redirect('/private');
});
app.get('/login',
  function(req, res){
    res.render('login/login', {error: req.flash('error'), title: "Login"});
  });
  
app.post('/login', 
  passport.authenticate('local-login', { failureRedirect: '/', failureFlash: 'Invalid username or password.' }),
  function(req, res) {
    res.redirect('/private');
  });
  
app.get('/logout',
  function(req, res){
    req.logout();
    res.redirect('/');
  });

app.get('/private',
  require('connect-ensure-login').ensureLoggedIn(),
  function(req, res){
    res.render('login/profile', { user: req.user, title: "Private Profile" });
  });

app.listen(3000, () => {
    console.log("We've now got a server!");
    console.log("Your routes will be running on http://localhost:3000");
});*/
