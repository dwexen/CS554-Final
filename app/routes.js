var publisher = require("./publisher");
module.exports = function(app, passport) {
    var User = require('../app/models/user');
    var graph = require('fbgraph');
    var Twitter = require('twitter');
    var configAuth = require('../config/auth');
    var OAuth2 = require('OAuth').OAuth2;

    var redis = require("redis");
    var pub = redis.createClient();

    const data = require("../data");
    var pages = data.pages;
    const sampleData = require("../sampleData.json");

    function ensureAuthenticated(req, res, next) {
        if (req.isAuthenticated()) { return next(); }
        console.log('not authenticated');
        res.redirect('/login')
    };

// normal routes ===============================================================

    //prevent user from visiting feed, profile, and social media authentication pages if not logged in
    app.all('*', function(req,res,next){
        console.log("req.params is ", req.params);
        if (req.params[0] === '/' || req.params[0] === '/login' || req.params[0] === '/signup' || req.params[0] === '/logout')
            next();
        else
            ensureAuthenticated(req,res,next);  
    });

    // show the home page (will also have our login links)
    app.get('/', function(req, res) {
        res.render('index.ejs');
    });

    app.get('/feed', function(req, res) {
        pages.getAllPages().then((pagesList) => {
            res.render('home.ejs', {
                pages: pagesList
            });
        }).catch(() => {
            // Something went wrong with the server!
            res.sendStatus(500);
        });
        // res.render('home.ejs', {
        //     pages: sampleData
        // });
    });

    // PROFILE SECTION =========================
    app.get('/profile', isLoggedIn, function(req, res) {
        res.render('profile.ejs', {
            user : req.user
        });
    });

    // LOGOUT ==============================
    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });

// =============================================================================
// AUTHENTICATE (FIRST LOGIN) ==================================================
// =============================================================================

    // locally --------------------------------
        // LOGIN ===============================
        // show the login form
        app.get('/login', function(req, res) {
            res.render('login.ejs', { message: req.flash('loginMessage') });
        });

        // process the login form
        app.post('/login', passport.authenticate('local-login', {
            //successRedirect : '/profile', // redirect to the secure profile section
            failureRedirect : '/login', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
        }), publisher.publishTweets, (req, res) => res.redirect('/profile'));

        // SIGNUP =================================
        // show the signup form
        app.get('/signup', function(req, res) {
            res.render('signup.ejs', { message: req.flash('signupMessage') });
        });

        // process the signup form
        app.post('/signup', passport.authenticate('local-signup', {
            successRedirect : '/profile', // redirect to the secure profile section
            failureRedirect : '/signup', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
        }));

    // facebook -------------------------------

        // send to facebook to do the authentication
        app.get('/auth/facebook', passport.authenticate('facebook', { scope : 'email' }));

        // handle the callback after facebook has authenticated the user
        app.get('/auth/facebook/callback',
            passport.authenticate('facebook', {
                successRedirect : '/profile',
                failureRedirect : '/'
            }));

    // twitter --------------------------------

        // send to twitter to do the authentication
        app.get('/auth/twitter', passport.authenticate('twitter', { scope : 'email' }));

        // handle the callback after twitter has authenticated the user
        app.get('/auth/twitter/callback',
            passport.authenticate('twitter', {
                successRedirect : '/profile',
                failureRedirect : '/'
            }));


    // google ---------------------------------

        // send to google to do the authentication
        app.get('/auth/google', passport.authenticate('google', { scope : ['profile', 'email'] }));

        // the callback after google has authenticated the user
        app.get('/auth/google/callback',
            passport.authenticate('google', {
                successRedirect : '/profile',
                failureRedirect : '/'
            }));

// =============================================================================
// AUTHORIZE (ALREADY LOGGED IN / CONNECTING OTHER SOCIAL ACCOUNT) =============
// =============================================================================

    // locally --------------------------------
        app.get('/connect/local', function(req, res) {
            res.render('connect-local.ejs', { message: req.flash('loginMessage') });
        });
        app.post('/connect/local', passport.authenticate('local-signup', {
            successRedirect : '/profile', // redirect to the secure profile section
            failureRedirect : '/connect/local', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
        }));

    // facebook -------------------------------

        // send to facebook to do the authentication
        app.get('/connect/facebook', passport.authorize('facebook', {authType: 'rerequest', scope : ['email', 'user_friends', 'public_profile'] }));

        // handle the callback after facebook has authorized the user
        app.get('/connect/facebook/callback',
            passport.authorize('facebook', {
                successRedirect : '/profile',
                failureRedirect : '/'
            }));
        app.post('/analyze', function(req, res){
            
            let mySinceID = req.user.twitter.sinceID;
            //if(mySinceID)
            var Twitter = require('twitter');
            //console.log(bearer_token);
            var client = new Twitter({
            consumer_key: configAuth.twitterAuth.consumerKey,
            consumer_secret: configAuth.twitterAuth.consumerSecret,
            bearer_token: "AAAAAAAAAAAAAAAAAAAAAPq40gAAAAAA8%2BWzg0FOhSNVRuR%2F%2FP4PMplbAf4%3D7QFKd7nUDL8aPKESoAXldb1VA6oaFMjMVOSG17dQ3buFAZKeaE"
            });
            
            var params = {screen_name: req.user.twitter.username, count: 20, since_id: mySinceID};
            client.get('statuses/user_timeline', params, function(error, tweets, response) {
            if (!error) {
                console.log(tweets.length);
                
                //method on user to save the current date
                //let niceArray = [];
                let firstTweetSinceID = tweets[0].id;
                let userID = req.user._id;
                let pubUser = {user: userID, posts: []};
                req.user.updateSinceID(req.user._id, firstTweetSinceID);
                for(var i = 0; i < tweets.length; i++)
                {
                    //let createdAt = tweets[i].created_at;
                    let text = tweets[i].text;
                    //let accessedAt = new Date().toISOString();
                    
                    pubUser.posts.push(text);
                }
                pub.publish("cs554-final/user.post", JSON.stringify(pubUser));
            }
            else
            {
                console.log(error);
            }
            });
            res.redirect('/profile');
        });

    // twitter --------------------------------

        // send to twitter to do the authentication
        app.get('/connect/twitter', passport.authorize('twitter', { scope : 'email' }));

        // handle the callback after twitter has authorized the user
        app.get('/connect/twitter/callback',
            passport.authorize('twitter', {
                successRedirect : '/profile',
                failureRedirect : '/'
            }));


    // google ---------------------------------

        // send to google to do the authentication
        app.get('/connect/google', passport.authorize('google', { scope : ['profile', 'email'] }));

        // the callback after google has authorized the user
        app.get('/connect/google/callback',
            passport.authorize('google', {
                successRedirect : '/profile',
                failureRedirect : '/'
            }));

// =============================================================================
// UNLINK ACCOUNTS =============================================================
// =============================================================================
// used to unlink accounts. for social accounts, just remove the token
// for local account, remove email and password
// user account will stay active in case they want to reconnect in the future

    // local -----------------------------------
    app.get('/unlink/local', isLoggedIn, function(req, res) {
        var user            = req.user;
        user.local.email    = undefined;
        user.local.password = undefined;
        user.save(function(err) {
            res.redirect('/profile');
        });
    });

    // facebook -------------------------------
    app.get('/unlink/facebook', isLoggedIn, function(req, res) {
        var user            = req.user;
        user.facebook.token = undefined;
        user.save(function(err) {
            res.redirect('/profile');
        });
    });

    // twitter --------------------------------
    app.get('/unlink/twitter', isLoggedIn, function(req, res) {
        var user           = req.user;
        user.twitter.token = undefined;
        user.save(function(err) {
            res.redirect('/profile');
        });
    });

    // google ---------------------------------
    app.get('/unlink/google', isLoggedIn, function(req, res) {
        var user          = req.user;
        user.google.token = undefined;
        user.save(function(err) {
            res.redirect('/profile');
        });
    });


};

// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();

    res.redirect('/');
}


