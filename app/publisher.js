var User = require('../app/models/user');
var Twitter = require('twitter');
var configAuth = require('../config/auth');
var redis = require("redis");
var pub = redis.createClient();

module.exports = {
publishTweets(req, res, next)
{
    console.log("I AM RUNNING!!!!");
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
            tweets = tweets.slice(0, -1);
            console.log("TWEET ARRAY LENGTH" + tweets.length);
            if(tweets.length == 0)
            {
                return next();
            }
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
            //pubUser = pubUser.slice(0, -1);
            pub.publish("cs554-final/user.post", JSON.stringify(pubUser));
            return next();
        }
        else
        {
            console.log(error);
            return next();
        }
        });
}
}