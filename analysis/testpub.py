
import redis

queue = redis.StrictRedis(host="localhost", port=6379, db=0)
channel = queue.pubsub()

for i in range(10):
  queue.publish("test", i)
