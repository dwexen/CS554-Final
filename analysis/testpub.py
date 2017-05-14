
import redis, json
from pymongo import MongoClient, ReturnDocument

queue = redis.StrictRedis(host="localhost", port=6379, db=0)
channel = queue.pubsub()

USER_POST_CHANNEL = "cs554-final/user.post"

mongo = MongoClient("localhost", 27017)
users = mongo["cs554-final"]["users"]

for user in users.find():
  data = { "user": str(user["_id"]),
           "post": "i love poached eggs with corned beef and hash" }
  queue.publish(USER_POST_CHANNEL, json.dumps(data))
