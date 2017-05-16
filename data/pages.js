const mongoCollections = require("../config/mongoCollections");
const page = mongoCollections.pages;
const uuid = require('uuid');


let exportMethods = {
    getAllPages() {
		return page().then((pageCollection) => {
			return pageCollection.find({}).toArray();
		});
	},
    getPageById(id) {
        return page().then((pageCollection) => {
			return pageCollection.findOne({_id: id}).then((page) => {
				if(!page) throw "Task not found";
				return page;
			});
		});
    },
    addPage(url, relevancy)
    {
        return page().then((pageCol) => {
            let newPage = {
                _id: uuid.v4(),
                url: url,
                relevnacy: relevancy
            };
            return pageCol.insertOne(newPage).then((newInsertInfo) => {
				return newInsertInfo.insertedId;
			}).then((newId) => {
				return this.getPageById(newId);
			});
        });
    },
    getPagesRelatedToInterests(user, relevancy=1)
    {
        return page().then((pageCol) => {
            var userInterests = user.interests.map(
              (interest) => interest.stemmed_name);
            let results = pageCol.find({stemmed_topics: {$in: userInterests}}).toArray();
            return results;
        });
    }
}

module.exports = exportMethods;
