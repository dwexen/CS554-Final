const mongoCollections = require("../config/mongoCollections");
const user = mongoCollections.users;
const uuid = require('uuid');


let exportMethods = {
    getAllUsers() {
		return user().then((userCollection) => {
			return userCollection.find({}).toArray();
		});
	},
    getUserById(id) {
        return user().then((userCollection) => {
			return userCollection.findOne({_id: id}).then((user) => {
				if(!user) return null;
				return user;
			});
		});
    },
    getUserByName(username) {
        console.log("GETTING: " + username);
        return user().then((userCollection) => {
            return userCollection.findOne({username: username}).then((user) => {
                if(!user) {
                    console.log("obvious error");
                    return null;
                }
                return user;
            });
        });
    },
    addUser(username, password)
    {
        console.log("ADDING USER");
        return user().then((userCol) => {
            let newUser = {
                _id: uuid.v4(),
                username: username,
                password: password
            };
            return userCol.insertOne(newUser).then((newInsertInfo) => {
				return newInsertInfo.insertedId;
			}).then((newId) => {
				return this.getUserById(newId);
			});
        });
    }
}

module.exports = exportMethods;