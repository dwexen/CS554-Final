
import redis, json, sys
from pymongo import MongoClient, ReturnDocument

queue = redis.StrictRedis(host="localhost", port=6379, db=0)
channel = queue.pubsub()

USER_POST_CHANNEL = "cs554-final/user.post"

mongo = MongoClient("localhost", 27017)
users = mongo["cs554-final"]["users"]

if len(sys.argv) <= 2:
  print("Usage: python", sys.argv[0], "user", "'sentence'")

matched_users = users.find({ "name": sys.argv[1] })

for user in matched_users:
  data = { "user": str(user["_id"]),
           "post": sys.argv[2] }
  queue.publish(USER_POST_CHANNEL, json.dumps(data))
