
from pymongo import MongoClient, ReturnDocument

mongo = MongoClient("localhost", 27017)
users = mongo["cs554-final"]["users"]
pages = mongo["cs554-final"]["pages"]


result = users.aggregate([
  {"$unwind": "$interests"},
  {"$group" : {"_id": {"id": "$_id", "interest": "$interests.name"},
               "neu": {"$avg": "$interests.neu"},
               "pos": {"$avg": "$interests.pos"},
               "neg": {"$avg": "$interests.neg"}}},
  {"$group" : {"_id": "$_id.id",
               "interests": {"$addToSet": {
                "name": "$_id.interest",
                "pos": "$pos",
                "neg": "$neg",
                "neu": "$neu"}}}}
])

for user in result:
  print("User", user["_id"], "feels:")
  interests = [ interest["name"] for interest in user["interests"] ]
  relevant_articles = pages.find({ "topics": { "$in": interests }})

  for item in user["interests"]:
    if item["pos"] >= item["neg"]:
      print("  good about", "'%s'" % item["name"])
    else:
      print("  bad  about", "'%s'" % item["name"])

  print()
  print("  They would enjoy:")
  for article in relevant_articles:
    print("  -", article["title"][:50], "...")
  print()

