// load the things we need
var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');

// define the schema for our user model
var userSchema = mongoose.Schema({

    local            : {
        email        : String,
        password     : String
    },
    facebook         : {
        id           : String,
        token        : String,
        email        : String,
        name         : String
    },
    twitter          : {
        id           : String,
        token        : String,
        displayName  : String,
        username     : String,
        sinceID      : Number
    },
    google           : {
        id           : String,
        token        : String,
        email        : String,
        name         : String
    },
    interests: [
    {
      name: String,     // something the user is interested in, like 'python'
      stemmed_name: String,  // all the meaning without the suffixes ;)
      neu: Number,      // within [0, 1]
      pos: Number,      // within [0, 1]
      neg: Number       // within [0, 1]
    }]

});

// generating a hash
userSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
userSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.local.password);
};

userSchema.methods.updateSinceID = function(uID, sinceID)
{
    var conditions = { _id: uID }
    ,update = { "twitter.sinceID": sinceID }
  
    //User.find(conditions, (err, numAffected) => console.log(numAffected));
    User.update(conditions, update,  (err, numAffected) =>  console.log(numAffected));
    //User.find(conditions, (err, numAffected) => console.log(numAffected));
    
}

// create the model for users and expose it to our app

const User = mongoose.model('User', userSchema);
module.exports = User;
