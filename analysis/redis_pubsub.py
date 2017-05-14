
import redis
from pymongo import MongoClient

client = MongoClient("localhost", 27017)
db = client["cs554-final"]

pages = db["pages"]

r = redis.StrictRedis(host="localhost", port=6379, db=0)
channel = r.pubsub()
channel.subscribe("test")

gen = channel.listen()

while True:
  message = next(gen)
  print("received", message)

