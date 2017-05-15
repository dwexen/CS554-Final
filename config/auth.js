// config/auth.js

// expose our config directly to our application using module.exports
module.exports = {

    'facebookAuth' : {
        'clientID'        : '381836252217644', // your App ID
        'clientSecret'    : '90cc4640ca542fb5aaf16d510dbf1d45',//'your-client-secret-here', // your App Secret
        'callbackURL'     : 'http://localhost:8080/auth/facebook/callback',
        'profileURL': 'https://graph.facebook.com/v2.5/me?fields=first_name,last_name,email'

    },

    'twitterAuth' : {
        'consumerKey'        : 'zw5Diza5JMEIQXs2EbyXbffnt',//'your-consumer-key-here',
        'consumerSecret'     : '71qdaKs3N8E8dtpsS7yTV44SN6RysbeXzw5h9aLwop7gTTEKBI',//'your-client-secret-here',
        'callbackURL'        : 'http://localhost:8080/auth/twitter/callback'
    },

    'googleAuth' : {
        'clientID'         : '906090592884-06rs7kq1qr65kl4imk2cub8r1jrdf0fg.apps.googleusercontent.com',//'your-secret-clientID-here',
        'clientSecret'     : 'uhqwwKjCrn1AXudRWE76R4Dh',//'your-client-secret-here',
        'callbackURL'      : 'http://localhost:8080/auth/google/callback'
    }

};
